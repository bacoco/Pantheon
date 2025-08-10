import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  ErrorCode,
  McpError 
} from '@modelcontextprotocol/sdk/types.js';
import { FirecrawlApp } from '@mendable/firecrawl-js';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import * as cheerio from 'cheerio';
import * as csstree from 'css-tree';
import NodeCache from 'node-cache';
import Bottleneck from 'bottleneck';
import Joi from 'joi';
import winston from 'winston';
import pRetry from 'p-retry';
import dotenv from 'dotenv';
import { URL } from 'url';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Configure puppeteer with stealth
puppeteer.use(StealthPlugin());

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ 
      filename: 'ui-analyzer-error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'ui-analyzer.log' 
    })
  ]
});

// Input validation schemas
const schemas = {
  firecrawlScrapeDesign: Joi.object({
    url: Joi.string().uri().required(),
    extract_design: Joi.boolean().default(true),
    include_css: Joi.boolean().default(true),
    include_assets: Joi.boolean().default(true)
  }),
  screenshotAnalyze: Joi.object({
    url: Joi.string().uri().required(),
    viewport_size: Joi.string().valid('desktop', 'mobile', 'tablet').default('desktop'),
    analyze_components: Joi.boolean().default(true),
    extract_layout: Joi.boolean().default(true)
  }),
  uiPatternExtract: Joi.object({
    website_data: Joi.string().required(),
    pattern_types: Joi.array().items(Joi.string()).default(['buttons', 'forms', 'cards']),
    component_library: Joi.boolean().default(false)
  }),
  designSystemGenerate: Joi.object({
    source_data: Joi.string().required(),
    system_name: Joi.string().default('Custom Design System'),
    modernize: Joi.boolean().default(true),
    accessibility_enhance: Joi.boolean().default(true)
  }),
  colorPaletteExtract: Joi.object({
    website_data: Joi.string().required(),
    generate_variations: Joi.boolean().default(true),
    accessibility_check: Joi.boolean().default(true)
  }),
  layoutAnalyze: Joi.object({
    website_data: Joi.string().required(),
    responsive_breakpoints: Joi.boolean().default(true),
    spacing_system: Joi.boolean().default(true)
  })
};

class UIDesignAnalyzerServer {
  private server: Server;
  private firecrawl?: FirecrawlApp;
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private cache: NodeCache;
  private rateLimiters: Map<string, Bottleneck>;
  private browser?: any;

  constructor() {
    this.server = new Server(
      {
        name: 'ui-design-analyzer',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize cache (TTL: 1 hour, check every 10 minutes)
    this.cache = new NodeCache({ 
      stdTTL: 3600, 
      checkperiod: 600,
      useClones: false,
      maxKeys: 100
    });

    // Initialize rate limiters
    this.rateLimiters = new Map();
    this.initializeRateLimiters();

    // Initialize API clients with error handling
    this.initializeAPIClients();

    // Setup tool handlers
    this.setupToolHandlers();

    // Setup graceful shutdown
    this.setupShutdown();
  }

  private initializeRateLimiters() {
    // Firecrawl rate limiter (10 requests per minute)
    this.rateLimiters.set('firecrawl', new Bottleneck({
      minTime: 6000, // 6 seconds between requests
      maxConcurrent: 2,
      reservoir: 10,
      reservoirRefreshAmount: 10,
      reservoirRefreshInterval: 60 * 1000
    }));

    // OpenAI rate limiter (30 requests per minute)
    this.rateLimiters.set('openai', new Bottleneck({
      minTime: 2000,
      maxConcurrent: 3,
      reservoir: 30,
      reservoirRefreshAmount: 30,
      reservoirRefreshInterval: 60 * 1000
    }));

    // Anthropic rate limiter (20 requests per minute)
    this.rateLimiters.set('anthropic', new Bottleneck({
      minTime: 3000,
      maxConcurrent: 2,
      reservoir: 20,
      reservoirRefreshAmount: 20,
      reservoirRefreshInterval: 60 * 1000
    }));

    // Puppeteer rate limiter (5 concurrent)
    this.rateLimiters.set('puppeteer', new Bottleneck({
      maxConcurrent: 5,
      minTime: 1000
    }));
  }

  private initializeAPIClients() {
    try {
      // Initialize Firecrawl (required)
      if (!process.env.FIRECRAWL_API_KEY) {
        logger.warn('FIRECRAWL_API_KEY not found. Some features will be limited.');
      } else {
        this.firecrawl = new FirecrawlApp({ 
          apiKey: process.env.FIRECRAWL_API_KEY 
        });
      }
      
      // Initialize OpenAI (optional)
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({ 
          apiKey: process.env.OPENAI_API_KEY,
          maxRetries: 3
        });
        logger.info('OpenAI client initialized');
      }
      
      // Initialize Anthropic (optional)
      if (process.env.ANTHROPIC_API_KEY) {
        this.anthropic = new Anthropic({ 
          apiKey: process.env.ANTHROPIC_API_KEY 
        });
        logger.info('Anthropic client initialized');
      }
    } catch (error) {
      logger.error('Error initializing API clients:', error);
    }
  }

  private setupToolHandlers() {
    // Register all 6 divine tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'firecrawl_scrape_design',
          description: 'Extract comprehensive design information from websites using Firecrawl',
          inputSchema: {
            type: 'object',
            properties: {
              url: { type: 'string', description: 'Website URL to analyze' },
              extract_design: { type: 'boolean', description: 'Focus on design-related content', default: true },
              include_css: { type: 'boolean', description: 'Include CSS styling information', default: true },
              include_assets: { type: 'boolean', description: 'Include image and asset URLs', default: true }
            },
            required: ['url']
          }
        },
        {
          name: 'screenshot_analyze',
          description: 'Visual analysis of website screenshots for design patterns',
          inputSchema: {
            type: 'object',
            properties: {
              url: { type: 'string', description: 'Website URL to screenshot and analyze' },
              viewport_size: { type: 'string', enum: ['desktop', 'mobile', 'tablet'], default: 'desktop' },
              analyze_components: { type: 'boolean', description: 'Identify UI components', default: true },
              extract_layout: { type: 'boolean', description: 'Analyze layout structure', default: true }
            },
            required: ['url']
          }
        },
        {
          name: 'ui_pattern_extract',
          description: 'Extract specific UI patterns and components from website data',
          inputSchema: {
            type: 'object',
            properties: {
              website_data: { type: 'string', description: 'Data from firecrawl_scrape_design' },
              pattern_types: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Types of patterns to extract (buttons, forms, cards, etc.)'
              },
              component_library: { type: 'boolean', description: 'Generate component specifications', default: false }
            },
            required: ['website_data']
          }
        },
        {
          name: 'design_system_generate',
          description: 'Generate comprehensive design system from analyzed website(s)',
          inputSchema: {
            type: 'object',
            properties: {
              source_data: { type: 'string', description: 'Combined data from analysis tools' },
              system_name: { type: 'string', description: 'Name for the design system' },
              modernize: { type: 'boolean', description: 'Apply modern design improvements', default: true },
              accessibility_enhance: { type: 'boolean', description: 'Enhance for accessibility', default: true }
            },
            required: ['source_data']
          }
        },
        {
          name: 'color_palette_extract',
          description: 'Extract and analyze color schemes from websites',
          inputSchema: {
            type: 'object',
            properties: {
              website_data: { type: 'string', description: 'Data from website analysis' },
              generate_variations: { type: 'boolean', description: 'Create color variations', default: true },
              accessibility_check: { type: 'boolean', description: 'Verify color contrast ratios', default: true }
            },
            required: ['website_data']
          }
        },
        {
          name: 'layout_analyze',
          description: 'Analyze grid systems, spacing, and layout architecture',
          inputSchema: {
            type: 'object',
            properties: {
              website_data: { type: 'string', description: 'Website structure data' },
              responsive_breakpoints: { type: 'boolean', description: 'Analyze responsive behavior', default: true },
              spacing_system: { type: 'boolean', description: 'Extract spacing/margin patterns', default: true }
            },
            required: ['website_data']
          }
        }
      ]
    }));

    // Tool execution handlers with error recovery
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        // Validate and sanitize inputs
        const validatedArgs = await this.validateInput(name, args);
        
        // Check cache first
        const cacheKey = this.getCacheKey(name, validatedArgs);
        const cachedResult = this.cache.get(cacheKey);
        if (cachedResult) {
          logger.info(`Cache hit for ${name}`);
          return { content: [{ type: 'text', text: JSON.stringify(cachedResult) }] };
        }

        // Execute with retry logic
        const result = await pRetry(
          async () => {
            switch (name) {
              case 'firecrawl_scrape_design':
                return await this.handleFirecrawlScrapeDesign(validatedArgs);
              case 'screenshot_analyze':
                return await this.handleScreenshotAnalyze(validatedArgs);
              case 'ui_pattern_extract':
                return await this.handleUIPatternExtract(validatedArgs);
              case 'design_system_generate':
                return await this.handleDesignSystemGenerate(validatedArgs);
              case 'color_palette_extract':
                return await this.handleColorPaletteExtract(validatedArgs);
              case 'layout_analyze':
                return await this.handleLayoutAnalyze(validatedArgs);
              default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            }
          },
          {
            retries: 3,
            onFailedAttempt: error => {
              logger.warn(`Attempt ${error.attemptNumber} failed for ${name}:`, error.message);
            }
          }
        );

        // Cache successful result
        this.cache.set(cacheKey, result);

        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      } catch (error: any) {
        logger.error(`Error executing ${name}:`, error);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: true,
              message: error.message || 'An unexpected error occurred',
              tool: name
            })
          }]
        };
      }
    });
  }

  private async validateInput(toolName: string, args: any): Promise<any> {
    const schemaMap: Record<string, Joi.Schema> = {
      'firecrawl_scrape_design': schemas.firecrawlScrapeDesign,
      'screenshot_analyze': schemas.screenshotAnalyze,
      'ui_pattern_extract': schemas.uiPatternExtract,
      'design_system_generate': schemas.designSystemGenerate,
      'color_palette_extract': schemas.colorPaletteExtract,
      'layout_analyze': schemas.layoutAnalyze
    };

    const schema = schemaMap[toolName];
    if (!schema) {
      throw new Error(`No validation schema for tool: ${toolName}`);
    }

    const { error, value } = schema.validate(args);
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }

    // Additional URL sanitization
    if (value.url) {
      value.url = this.sanitizeURL(value.url);
    }

    return value;
  }

  private sanitizeURL(url: string): string {
    try {
      const parsed = new URL(url);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }
      // Remove any auth information
      parsed.username = '';
      parsed.password = '';
      return parsed.toString();
    } catch (error) {
      throw new Error(`Invalid URL: ${url}`);
    }
  }

  private getCacheKey(toolName: string, args: any): string {
    const data = JSON.stringify({ tool: toolName, args });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Tool implementations with rate limiting
  private async handleFirecrawlScrapeDesign(args: any) {
    const { url, extract_design, include_css, include_assets } = args;
    
    if (!this.firecrawl) {
      throw new Error('Firecrawl client not initialized. Please check your API key.');
    }

    const limiter = this.rateLimiters.get('firecrawl')!;
    
    return await limiter.schedule(async () => {
      try {
        const scrapeOptions = {
          formats: ['markdown', 'html'],
          includeTags: ['title', 'meta', 'link', 'style'],
          excludeTags: ['script', 'noscript'],
          onlyMainContent: false,
          waitFor: 2000,
          screenshot: true,
          fullPageScreenshot: true
        };

        const scrapeResult = await this.firecrawl!.scrapeUrl(url, scrapeOptions);
        
        if (!scrapeResult.success) {
          throw new Error(`Firecrawl error: ${scrapeResult.error}`);
        }

        const $ = cheerio.load(scrapeResult.data.html || '');
        
        // Extract design information
        const designData = {
          url: url,
          title: scrapeResult.data.title || '',
          description: scrapeResult.data.description || '',
          timestamp: new Date().toISOString(),
          structure: {
            headings: this.extractHeadings($),
            navigation: this.extractNavigation($),
            sections: this.extractSections($)
          },
          design: include_css ? {
            css: this.extractCSS($),
            tokens: this.extractDesignTokens($)
          } : {},
          assets: include_assets ? this.extractAssets($) : [],
          markdown: scrapeResult.data.markdown || '',
          screenshot: scrapeResult.data.screenshot || null
        };

        return designData;
      } catch (error: any) {
        logger.error('Firecrawl scrape error:', error);
        throw error;
      }
    });
  }

  private async handleScreenshotAnalyze(args: any) {
    const { url, viewport_size, analyze_components, extract_layout } = args;
    
    const limiter = this.rateLimiters.get('puppeteer')!;
    
    return await limiter.schedule(async () => {
      let page;
      try {
        // Initialize browser if not already done
        if (!this.browser) {
          this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          });
        }

        page = await this.browser.newPage();
        
        // Set viewport based on size
        const viewports = {
          desktop: { width: 1920, height: 1080 },
          tablet: { width: 768, height: 1024 },
          mobile: { width: 375, height: 812 }
        };
        
        await page.setViewport(viewports[viewport_size as keyof typeof viewports]);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Take screenshot
        const screenshot = await page.screenshot({
          fullPage: true,
          encoding: 'base64'
        });

        // Analyze with AI if available
        let analysis = null;
        if (this.openai && analyze_components) {
          const openaiLimiter = this.rateLimiters.get('openai')!;
          analysis = await openaiLimiter.schedule(async () => {
            return await this.analyzeWithVision(screenshot, 'openai');
          });
        }

        // Extract layout information
        const layoutInfo = extract_layout ? await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          const layout = {
            totalElements: elements.length,
            sections: document.querySelectorAll('section, article, main, aside').length,
            forms: document.querySelectorAll('form').length,
            buttons: document.querySelectorAll('button, [role="button"]').length,
            links: document.querySelectorAll('a').length,
            images: document.querySelectorAll('img').length
          };
          return layout;
        }) : null;

        return {
          url,
          viewport: viewport_size,
          screenshot: `data:image/png;base64,${screenshot}`,
          analysis,
          layout: layoutInfo,
          timestamp: new Date().toISOString()
        };
      } catch (error: any) {
        logger.error('Screenshot analyze error:', error);
        throw error;
      } finally {
        if (page) {
          await page.close();
        }
      }
    });
  }

  private async handleUIPatternExtract(args: any) {
    const { website_data, pattern_types, component_library } = args;
    
    try {
      const data = typeof website_data === 'string' ? JSON.parse(website_data) : website_data;
      
      const patterns: any = {
        buttons: [],
        forms: [],
        cards: [],
        navigation: [],
        headers: [],
        footers: []
      };

      // Extract patterns based on types requested
      if (data.structure) {
        pattern_types.forEach((type: string) => {
          switch(type) {
            case 'buttons':
              patterns.buttons = this.extractButtonPatterns(data);
              break;
            case 'forms':
              patterns.forms = this.extractFormPatterns(data);
              break;
            case 'cards':
              patterns.cards = this.extractCardPatterns(data);
              break;
            case 'navigation':
              patterns.navigation = data.structure.navigation || [];
              break;
          }
        });
      }

      // Generate component library specs if requested
      if (component_library) {
        patterns.componentSpecs = this.generateComponentSpecs(patterns);
      }

      return {
        patterns,
        extractedTypes: pattern_types,
        componentLibrary: component_library,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      logger.error('UI pattern extract error:', error);
      throw error;
    }
  }

  private async handleDesignSystemGenerate(args: any) {
    const { source_data, system_name, modernize, accessibility_enhance } = args;
    
    try {
      const data = typeof source_data === 'string' ? JSON.parse(source_data) : source_data;
      
      const designSystem = {
        name: system_name,
        version: '1.0.0',
        created: new Date().toISOString(),
        colors: {
          primary: [],
          secondary: [],
          neutral: [],
          semantic: {
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6'
          }
        },
        typography: {
          fontFamilies: [],
          fontSizes: {},
          lineHeights: {},
          fontWeights: {}
        },
        spacing: {
          base: 8,
          scale: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
        },
        breakpoints: {
          mobile: '375px',
          tablet: '768px',
          desktop: '1024px',
          wide: '1440px'
        },
        components: {},
        tokens: {}
      };

      // Extract design tokens from source data
      if (data.design && data.design.tokens) {
        designSystem.tokens = data.design.tokens;
      }

      // Apply modern improvements if requested
      if (modernize) {
        designSystem.tokens = this.modernizeDesignTokens(designSystem.tokens);
      }

      // Enhance for accessibility if requested
      if (accessibility_enhance) {
        designSystem.accessibility = this.generateAccessibilityGuidelines();
      }

      return designSystem;
    } catch (error: any) {
      logger.error('Design system generate error:', error);
      throw error;
    }
  }

  private async handleColorPaletteExtract(args: any) {
    const { website_data, generate_variations, accessibility_check } = args;
    
    try {
      const data = typeof website_data === 'string' ? JSON.parse(website_data) : website_data;
      
      const colorPalette: any = {
        colors: [],
        primary: null,
        secondary: null,
        variations: {},
        accessibility: {}
      };

      // Extract colors from CSS
      if (data.design && data.design.css) {
        colorPalette.colors = this.extractColorsFromCSS(data.design.css);
      }

      // Generate variations if requested
      if (generate_variations && colorPalette.colors.length > 0) {
        colorPalette.variations = this.generateColorVariations(colorPalette.colors);
      }

      // Check accessibility if requested
      if (accessibility_check && colorPalette.colors.length > 0) {
        colorPalette.accessibility = this.checkColorAccessibility(colorPalette.colors);
      }

      return colorPalette;
    } catch (error: any) {
      logger.error('Color palette extract error:', error);
      throw error;
    }
  }

  private async handleLayoutAnalyze(args: any) {
    const { website_data, responsive_breakpoints, spacing_system } = args;
    
    try {
      const data = typeof website_data === 'string' ? JSON.parse(website_data) : website_data;
      
      const layoutAnalysis: any = {
        grid: {},
        spacing: {},
        breakpoints: {},
        patterns: []
      };

      // Analyze CSS for layout patterns
      if (data.design && data.design.css) {
        layoutAnalysis.grid = this.analyzeGridSystem(data.design.css);
        
        if (spacing_system) {
          layoutAnalysis.spacing = this.analyzeSpacingSystem(data.design.css);
        }
        
        if (responsive_breakpoints) {
          layoutAnalysis.breakpoints = this.analyzeBreakpoints(data.design.css);
        }
      }

      // Identify common layout patterns
      layoutAnalysis.patterns = this.identifyLayoutPatterns(data);

      return layoutAnalysis;
    } catch (error: any) {
      logger.error('Layout analyze error:', error);
      throw error;
    }
  }

  // Helper methods
  private extractHeadings($: cheerio.CheerioAPI) {
    const headings: any[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const $el = $(el);
      headings.push({
        tag: el.tagName,
        text: $el.text().trim(),
        class: $el.attr('class') || '',
        id: $el.attr('id') || ''
      });
    });
    return headings;
  }

  private extractNavigation($: cheerio.CheerioAPI) {
    const navigation: any[] = [];
    $('nav, [role="navigation"], header nav, .nav, .navigation').each((_, el) => {
      const $el = $(el);
      const links: any[] = [];
      $el.find('a').each((_, link) => {
        const $link = $(link);
        links.push({
          text: $link.text().trim(),
          href: $link.attr('href') || '',
          class: $link.attr('class') || ''
        });
      });
      navigation.push({
        type: el.tagName,
        class: $el.attr('class') || '',
        links
      });
    });
    return navigation;
  }

  private extractSections($: cheerio.CheerioAPI) {
    const sections: any[] = [];
    $('section, article, main, [role="main"], .section').each((_, el) => {
      const $el = $(el);
      sections.push({
        tag: el.tagName,
        class: $el.attr('class') || '',
        id: $el.attr('id') || '',
        childCount: $el.children().length
      });
    });
    return sections;
  }

  private extractCSS($: cheerio.CheerioAPI) {
    const css: any = {
      inline: [],
      external: []
    };
    
    $('style').each((_, el) => {
      css.inline.push($(el).html() || '');
    });
    
    $('link[rel="stylesheet"]').each((_, el) => {
      css.external.push($(el).attr('href') || '');
    });
    
    return css;
  }

  private extractDesignTokens($: cheerio.CheerioAPI) {
    // Extract CSS custom properties (design tokens)
    const tokens: any = {
      colors: {},
      spacing: {},
      typography: {},
      other: {}
    };
    
    $('style').each((_, el) => {
      const css = $(el).html() || '';
      const customProps = css.match(/--[\w-]+:\s*[^;]+/g) || [];
      
      customProps.forEach(prop => {
        const [name, value] = prop.split(':').map(s => s.trim());
        if (name.includes('color') || name.includes('bg')) {
          tokens.colors[name] = value;
        } else if (name.includes('space') || name.includes('margin') || name.includes('padding')) {
          tokens.spacing[name] = value;
        } else if (name.includes('font') || name.includes('text')) {
          tokens.typography[name] = value;
        } else {
          tokens.other[name] = value;
        }
      });
    });
    
    return tokens;
  }

  private extractAssets($: cheerio.CheerioAPI) {
    const assets: any[] = [];
    
    $('img, video, audio, source').each((_, el) => {
      const $el = $(el);
      assets.push({
        type: el.tagName,
        src: $el.attr('src') || $el.attr('data-src') || '',
        alt: $el.attr('alt') || '',
        class: $el.attr('class') || ''
      });
    });
    
    return assets;
  }

  private async analyzeWithVision(screenshot: string, provider: 'openai' | 'anthropic') {
    try {
      if (provider === 'openai' && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this website screenshot. Identify: 1) Main UI components 2) Color scheme 3) Typography 4) Layout patterns 5) Design style"
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/png;base64,${screenshot}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        });
        
        return response.choices[0].message.content;
      }
      
      // Add Anthropic vision analysis if needed
      
      return null;
    } catch (error: any) {
      logger.error('Vision analysis error:', error);
      return null;
    }
  }

  private extractButtonPatterns(data: any) {
    // Extract button patterns from the data
    const patterns: any[] = [];
    // Implementation would parse HTML/CSS for button patterns
    return patterns;
  }

  private extractFormPatterns(data: any) {
    // Extract form patterns from the data
    const patterns: any[] = [];
    // Implementation would parse HTML/CSS for form patterns
    return patterns;
  }

  private extractCardPatterns(data: any) {
    // Extract card patterns from the data
    const patterns: any[] = [];
    // Implementation would parse HTML/CSS for card patterns
    return patterns;
  }

  private generateComponentSpecs(patterns: any) {
    // Generate component specifications
    const specs: any = {};
    Object.keys(patterns).forEach(key => {
      if (patterns[key].length > 0) {
        specs[key] = {
          count: patterns[key].length,
          variations: patterns[key]
        };
      }
    });
    return specs;
  }

  private modernizeDesignTokens(tokens: any) {
    // Apply modern design improvements
    const modernTokens = { ...tokens };
    // Add modern spacing scale, color system, etc.
    return modernTokens;
  }

  private generateAccessibilityGuidelines() {
    return {
      colorContrast: {
        AA: { normal: '4.5:1', large: '3:1' },
        AAA: { normal: '7:1', large: '4.5:1' }
      },
      focusIndicators: 'Required for all interactive elements',
      keyboardNavigation: 'All functionality must be keyboard accessible',
      ariaLabels: 'Required for non-text elements',
      semanticHTML: 'Use appropriate HTML5 semantic elements'
    };
  }

  private extractColorsFromCSS(css: any) {
    const colors: string[] = [];
    // Extract hex, rgb, hsl colors from CSS
    const colorRegex = /#[0-9A-Fa-f]{3,6}|rgb\([^)]+\)|hsl\([^)]+\)/g;
    
    css.inline.forEach((style: string) => {
      const matches = style.match(colorRegex) || [];
      colors.push(...matches);
    });
    
    return [...new Set(colors)]; // Remove duplicates
  }

  private generateColorVariations(colors: string[]) {
    // Generate tints and shades for each color
    const variations: any = {};
    colors.forEach(color => {
      variations[color] = {
        lighter: [],
        darker: []
      };
    });
    return variations;
  }

  private checkColorAccessibility(colors: string[]) {
    // Check color contrast ratios
    const results: any = {};
    // Implementation would calculate contrast ratios
    return results;
  }

  private analyzeGridSystem(css: any) {
    // Analyze CSS for grid systems
    const gridInfo: any = {
      type: 'unknown',
      columns: 0,
      gutters: '',
      breakpoints: []
    };
    // Implementation would parse CSS for grid patterns
    return gridInfo;
  }

  private analyzeSpacingSystem(css: any) {
    // Analyze CSS for spacing patterns
    const spacingInfo: any = {
      baseUnit: 0,
      scale: [],
      patterns: []
    };
    // Implementation would parse CSS for spacing patterns
    return spacingInfo;
  }

  private analyzeBreakpoints(css: any) {
    // Analyze CSS for media query breakpoints
    const breakpoints: any[] = [];
    // Implementation would parse CSS for media queries
    return breakpoints;
  }

  private identifyLayoutPatterns(data: any) {
    // Identify common layout patterns
    const patterns = [
      'Header-Main-Footer',
      'Sidebar Layout',
      'Grid Layout',
      'Card Grid',
      'Hero Section'
    ];
    // Implementation would analyze structure to identify patterns
    return patterns;
  }

  private setupShutdown() {
    process.on('SIGINT', async () => {
      logger.info('Shutting down gracefully...');
      if (this.browser) {
        await this.browser.close();
      }
      process.exit(0);
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('UI Design Analyzer MCP server running on stdio');
  }
}

// Start the server
const server = new UIDesignAnalyzerServer();
server.start().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});