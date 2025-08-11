import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  ErrorCode,
  McpError 
} from '@modelcontextprotocol/sdk/types.js';
import FirecrawlApp from '@mendable/firecrawl-js';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { OpenAI } from 'openai';
// import { Anthropic } from '@anthropic-ai/sdk';
import * as cheerio from 'cheerio';
// import * as csstree from 'css-tree';
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
  // private anthropic?: Anthropic;
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
      // if (process.env.ANTHROPIC_API_KEY) {
      //   this.anthropic = new Anthropic({ 
      //     apiKey: process.env.ANTHROPIC_API_KEY 
      //   });
      //   logger.info('Anthropic client initialized');
      // }
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
      throw new Error(`Validation error: ${error.details?.[0]?.message || 'Validation failed'}`);
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
    const { url, include_css, include_assets } = args;
    
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

        const scrapeResult = await this.firecrawl!.scrapeUrl(url, scrapeOptions as any);
        
        if (!scrapeResult.success) {
          throw new Error(`Firecrawl error: ${(scrapeResult as any).error}`);
        }

        const resultData = (scrapeResult as any).data || scrapeResult;
        const $ = cheerio.load(resultData.html || '');
        
        // Extract design information
        const designData = {
          url: url,
          title: resultData.title || '',
          description: resultData.description || '',
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
          markdown: resultData.markdown || '',
          screenshot: resultData.screenshot || null
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
        (designSystem as any).accessibility = this.generateAccessibilityGuidelines();
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
        if (name && value) {
          if (name.includes('color') || name.includes('bg')) {
            tokens.colors[name] = value;
          } else if (name.includes('space') || name.includes('margin') || name.includes('padding')) {
            tokens.spacing[name] = value;
          } else if (name.includes('font') || name.includes('text')) {
            tokens.typography[name] = value;
          } else {
            tokens.other[name] = value;
          }
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
        
        return response.choices[0]?.message?.content || null;
      }
      
      // Add Anthropic vision analysis if needed
      
      return null;
    } catch (error: any) {
      logger.error('Vision analysis error:', error);
      return null;
    }
  }

  private extractButtonPatterns(data: any) {
    const patterns: any[] = [];
    
    if (data.structure && data.structure.navigation) {
      // Extract button patterns from navigation
      data.structure.navigation.forEach((nav: any) => {
        nav.links?.forEach((link: any) => {
          if (link.class && (link.class.includes('btn') || link.class.includes('button'))) {
            patterns.push({
              type: 'link-button',
              text: link.text,
              classes: link.class,
              href: link.href
            });
          }
        });
      });
    }
    
    if (data.markdown) {
      // Extract button patterns from markdown content
      const buttonRegex = /<button[^>]*>([^<]*)<\/button>/gi;
      const linkButtonRegex = /<a[^>]*class="[^"]*(?:btn|button)[^"]*"[^>]*>([^<]*)<\/a>/gi;
      
      let match;
      while ((match = buttonRegex.exec(data.markdown)) !== null) {
        patterns.push({
          type: 'button',
          text: match[1],
          html: match[0]
        });
      }
      
      while ((match = linkButtonRegex.exec(data.markdown)) !== null) {
        patterns.push({
          type: 'link-button',
          text: match[1],
          html: match[0]
        });
      }
    }
    
    if (data.design && data.design.css) {
      // Extract button styles from CSS
      data.design.css.inline?.forEach((css: string) => {
        const buttonStyleRegex = /\.(?:btn|button)[^{]*\{([^}]*)\}/gi;
        let match;
        while ((match = buttonStyleRegex.exec(css)) !== null) {
          const styles = match[1]!.trim().split(';').filter(s => s);
          const styleObj: any = {};
          
          styles.forEach(style => {
            const [prop, value] = style.split(':').map(s => s.trim());
            if (prop && value) {
              styleObj[prop] = value;
            }
          });
          
          patterns.push({
            type: 'button-style',
            selector: match[0].split('{')[0].trim(),
            styles: styleObj
          });
        }
      });
    }
    
    // Deduplicate and enrich patterns
    const uniquePatterns = new Map();
    patterns.forEach(pattern => {
      const key = `${pattern.type}-${pattern.text || pattern.selector}`;
      if (!uniquePatterns.has(key)) {
        uniquePatterns.set(key, pattern);
      }
    });
    
    return Array.from(uniquePatterns.values());
  }

  private extractFormPatterns(data: any) {
    const patterns: any[] = [];
    
    if (data.markdown) {
      // Extract form elements from markdown/HTML
      const formRegex = /<form[^>]*>([\s\S]*?)<\/form>/gi;
      const inputRegex = /<input[^>]*>/gi;
      const textareaRegex = /<textarea[^>]*>[\s\S]*?<\/textarea>/gi;
      const selectRegex = /<select[^>]*>[\s\S]*?<\/select>/gi;
      
      let match;
      while ((match = formRegex.exec(data.markdown)) !== null) {
        const formContent = match[1];
        const formPattern: any = {
          type: 'form',
          html: match[0],
          elements: []
        };
        
        // Extract form attributes
        const actionMatch = /action="([^"]*)"/.exec(match[0]);
        const methodMatch = /method="([^"]*)"/.exec(match[0]);
        if (actionMatch) formPattern.action = actionMatch[1];
        if (methodMatch) formPattern.method = methodMatch[1];
        
        // Extract inputs
        let inputMatch;
        while ((inputMatch = inputRegex.exec(formContent)) !== null) {
          const typeMatch = /type="([^"]*)"/.exec(inputMatch[0]);
          const nameMatch = /name="([^"]*)"/.exec(inputMatch[0]);
          const placeholderMatch = /placeholder="([^"]*)"/.exec(inputMatch[0]);
          
          formPattern.elements.push({
            element: 'input',
            type: typeMatch ? typeMatch[1] : 'text',
            name: nameMatch ? nameMatch[1] : null,
            placeholder: placeholderMatch ? placeholderMatch[1] : null
          });
        }
        
        // Extract textareas
        let textareaMatch;
        while ((textareaMatch = textareaRegex.exec(formContent)) !== null) {
          const nameMatch = /name="([^"]*)"/.exec(textareaMatch[0]);
          formPattern.elements.push({
            element: 'textarea',
            name: nameMatch ? nameMatch[1] : null
          });
        }
        
        // Extract selects
        let selectMatch;
        while ((selectMatch = selectRegex.exec(formContent)) !== null) {
          const nameMatch = /name="([^"]*)"/.exec(selectMatch[0]);
          const optionMatches = selectMatch[0].match(/<option[^>]*>([^<]*)<\/option>/gi) || [];
          
          formPattern.elements.push({
            element: 'select',
            name: nameMatch ? nameMatch[1] : null,
            options: optionMatches.length
          });
        }
        
        patterns.push(formPattern);
      }
      
      // Extract standalone inputs not in forms
      const standaloneInputs = data.markdown.match(inputRegex) || [];
      standaloneInputs.forEach((input: string) => {
        if (!data.markdown.includes('<form') || !input.includes('</form>')) {
          const typeMatch = /type="([^"]*)"/.exec(input);
          const nameMatch = /name="([^"]*)"/.exec(input);
          
          patterns.push({
            type: 'standalone-input',
            element: 'input',
            inputType: typeMatch ? typeMatch[1] : 'text',
            name: nameMatch ? nameMatch[1] : null,
            html: input
          });
        }
      });
    }
    
    if (data.design && data.design.css) {
      // Extract form styles from CSS
      data.design.css.inline?.forEach((css: string) => {
        const formStyleRegex = /(?:form|input|textarea|select)[^{]*\{([^}]*)\}/gi;
        let match;
        while ((match = formStyleRegex.exec(css)) !== null) {
          patterns.push({
            type: 'form-style',
            selector: match[0].split('{')[0].trim(),
            styles: match[1].trim()
          });
        }
      });
    }
    
    // Add form validation patterns if detected
    if (data.markdown && data.markdown.includes('required')) {
      patterns.push({
        type: 'validation',
        hasRequiredFields: true,
        patterns: ['required attribute detected']
      });
    }
    
    return patterns;
  }

  private extractCardPatterns(data: any) {
    const patterns: any[] = [];
    
    if (data.structure && data.structure.sections) {
      // Look for card-like sections
      data.structure.sections.forEach((section: any) => {
        if (section.class && (section.class.includes('card') || section.class.includes('panel') || section.class.includes('box'))) {
          patterns.push({
            type: 'card-section',
            tag: section.tag,
            classes: section.class,
            childCount: section.childCount,
            id: section.id || null
          });
        }
      });
    }
    
    if (data.markdown) {
      // Extract card patterns from HTML structure
      const cardRegex = /<(?:div|article|section)[^>]*class="[^"]*(?:card|panel|box|tile)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|article|section)>/gi;
      
      let match;
      while ((match = cardRegex.exec(data.markdown)) !== null) {
        const cardContent = match[1];
        const cardPattern: any = {
          type: 'card',
          html: match[0].substring(0, 100) + '...',
          structure: {}
        };
        
        // Analyze card structure
        if (cardContent.includes('img') || cardContent.includes('image')) {
          cardPattern.structure.hasImage = true;
        }
        if (cardContent.includes('<h') || cardContent.includes('title')) {
          cardPattern.structure.hasTitle = true;
        }
        if (cardContent.includes('<p') || cardContent.includes('description')) {
          cardPattern.structure.hasDescription = true;
        }
        if (cardContent.includes('button') || cardContent.includes('btn')) {
          cardPattern.structure.hasAction = true;
        }
        
        // Extract card classes
        const classMatch = /class="([^"]*)"/.exec(match[0]);
        if (classMatch) {
          cardPattern.classes = classMatch[1];
        }
        
        patterns.push(cardPattern);
      }
      
      // Look for grid-based card layouts
      const gridRegex = /<div[^>]*class="[^"]*(?:grid|flex|cards|gallery)[^"]*"[^>]*>/gi;
      while ((match = gridRegex.exec(data.markdown)) !== null) {
        const classMatch = /class="([^"]*)"/.exec(match[0]);
        if (classMatch) {
          patterns.push({
            type: 'card-container',
            layout: classMatch[1].includes('grid') ? 'grid' : 'flex',
            classes: classMatch[1]
          });
        }
      }
    }
    
    if (data.design && data.design.css) {
      // Extract card styles from CSS
      data.design.css.inline?.forEach((css: string) => {
        const cardStyleRegex = /\.(?:card|panel|box|tile)[^{]*\{([^}]*)\}/gi;
        let match;
        while ((match = cardStyleRegex.exec(css)) !== null) {
          const styles = match[1].trim().split(';').filter(s => s);
          const styleObj: any = {};
          
          styles.forEach(style => {
            const [prop, value] = style.split(':').map(s => s.trim());
            if (prop && value) {
              // Extract key card styling properties
              if (prop.includes('shadow') || prop.includes('border') || prop.includes('radius') || prop.includes('padding')) {
                styleObj[prop] = value;
              }
            }
          });
          
          if (Object.keys(styleObj).length > 0) {
            patterns.push({
              type: 'card-style',
              selector: match[0].split('{')[0].trim(),
              styles: styleObj
            });
          }
        }
      });
    }
    
    // Deduplicate similar patterns
    const uniquePatterns = new Map();
    patterns.forEach(pattern => {
      const key = `${pattern.type}-${pattern.classes || pattern.selector || patterns.indexOf(pattern)}`;
      if (!uniquePatterns.has(key) || pattern.structure) {
        uniquePatterns.set(key, pattern);
      }
    });
    
    return Array.from(uniquePatterns.values());
  }

  private generateComponentSpecs(patterns: any) {
    const specs: any = {};
    
    Object.keys(patterns).forEach(key => {
      if (patterns[key] && patterns[key].length > 0) {
        const items = patterns[key];
        const spec: any = {
          count: items.length,
          variations: [],
          commonProperties: {},
          recommendations: []
        };
        
        // Analyze variations
        const propertyMap = new Map();
        
        items.forEach((item: any) => {
          // Categorize by type
          const variationType = item.type || 'default';
          let variation = spec.variations.find((v: any) => v.type === variationType);
          
          if (!variation) {
            variation = {
              type: variationType,
              instances: [],
              properties: {}
            };
            spec.variations.push(variation);
          }
          
          variation.instances.push(item);
          
          // Track common properties
          if (item.styles) {
            Object.keys(item.styles).forEach(prop => {
              if (!propertyMap.has(prop)) {
                propertyMap.set(prop, []);
              }
              propertyMap.get(prop).push(item.styles[prop]);
            });
          }
        });
        
        // Identify common properties
        propertyMap.forEach((values, prop) => {
          const uniqueValues = [...new Set(values)];
          if (uniqueValues.length === 1) {
            spec.commonProperties[prop] = uniqueValues[0];
          } else if (uniqueValues.length <= 3) {
            spec.commonProperties[prop] = {
              variations: uniqueValues
            };
          }
        });
        
        // Generate recommendations based on patterns
        if (key === 'buttons') {
          spec.recommendations.push('Consider creating a unified button component with size and variant props');
          if (spec.variations.length > 3) {
            spec.recommendations.push('Too many button variations - consider consolidating');
          }
        }
        
        if (key === 'forms') {
          spec.recommendations.push('Ensure all forms have proper validation and error handling');
          if (!items.some((i: any) => i.type === 'validation')) {
            spec.recommendations.push('Add form validation patterns');
          }
        }
        
        if (key === 'cards') {
          spec.recommendations.push('Standardize card layouts for consistency');
          if (spec.variations.length > 2) {
            spec.recommendations.push('Consider limiting card variations to 2-3 types');
          }
        }
        
        specs[key] = spec;
      }
    });
    
    // Add metadata
    specs._metadata = {
      generated_at: new Date().toISOString(),
      total_components: Object.keys(specs).filter(k => k !== '_metadata').length,
      has_consistency_issues: Object.values(specs).some((spec: any) => 
        spec.variations && spec.variations.length > 5
      )
    };
    
    return specs;
  }

  private modernizeDesignTokens(tokens: any) {
    const modernTokens: any = {
      colors: {},
      spacing: {},
      typography: {},
      shadows: {},
      radii: {},
      transitions: {},
      breakpoints: {},
      zIndices: {}
    };
    
    // Modernize colors
    if (tokens.colors) {
      Object.keys(tokens.colors).forEach(key => {
        const color = tokens.colors[key];
        const cleanKey = key.replace('--', '').replace(/-/g, '_');
        
        // Create a modern color scale
        modernTokens.colors[cleanKey] = {
          base: color,
          light: this.lightenColor(color, 0.2),
          lighter: this.lightenColor(color, 0.4),
          dark: this.darkenColor(color, 0.2),
          darker: this.darkenColor(color, 0.4),
          contrast: this.getContrastColor(color)
        };
      });
      
      // Add semantic colors if not present
      if (!modernTokens.colors.primary) {
        modernTokens.colors.primary = {
          base: '#3B82F6',
          light: '#60A5FA',
          lighter: '#93BBFC',
          dark: '#2563EB',
          darker: '#1D4ED8',
          contrast: '#FFFFFF'
        };
      }
    }
    
    // Modern spacing scale (8px base)
    const baseSpacing = 8;
    modernTokens.spacing = {
      xs: `${baseSpacing * 0.5}px`,    // 4px
      sm: `${baseSpacing * 0.75}px`,   // 6px
      md: `${baseSpacing}px`,          // 8px
      lg: `${baseSpacing * 1.5}px`,    // 12px
      xl: `${baseSpacing * 2}px`,      // 16px
      '2xl': `${baseSpacing * 3}px`,   // 24px
      '3xl': `${baseSpacing * 4}px`,   // 32px
      '4xl': `${baseSpacing * 6}px`,   // 48px
      '5xl': `${baseSpacing * 8}px`,   // 64px
      '6xl': `${baseSpacing * 12}px`   // 96px
    };
    
    // Merge existing spacing if available
    if (tokens.spacing) {
      Object.keys(tokens.spacing).forEach(key => {
        const value = tokens.spacing[key];
        if (value && !modernTokens.spacing[key]) {
          modernTokens.spacing[key] = value;
        }
      });
    }
    
    // Modern typography scale
    modernTokens.typography = {
      fontFamilies: {
        sans: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
        mono: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'
      },
      fontSizes: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem',// 30px
        '4xl': '2.25rem', // 36px
        '5xl': '3rem',    // 48px
        '6xl': '3.75rem'  // 60px
      },
      fontWeights: {
        thin: 100,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900
      },
      lineHeights: {
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2
      }
    };
    
    // Merge existing typography
    if (tokens.typography) {
      Object.keys(tokens.typography).forEach(key => {
        if (tokens.typography[key] && typeof tokens.typography[key] === 'object') {
          modernTokens.typography[key] = {
            ...modernTokens.typography[key],
            ...tokens.typography[key]
          };
        }
      });
    }
    
    // Modern shadows
    modernTokens.shadows = {
      xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      none: 'none'
    };
    
    // Modern border radii
    modernTokens.radii = {
      none: '0',
      sm: '0.125rem',   // 2px
      md: '0.25rem',    // 4px
      lg: '0.5rem',     // 8px
      xl: '0.75rem',    // 12px
      '2xl': '1rem',    // 16px
      '3xl': '1.5rem',  // 24px
      full: '9999px'
    };
    
    // Modern transitions
    modernTokens.transitions = {
      fast: '150ms ease-in-out',
      base: '250ms ease-in-out',
      slow: '350ms ease-in-out',
      slower: '500ms ease-in-out'
    };
    
    // Modern breakpoints
    modernTokens.breakpoints = {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    };
    
    // Z-index scale
    modernTokens.zIndices = {
      hide: -1,
      base: 0,
      dropdown: 1000,
      sticky: 1100,
      overlay: 1200,
      modal: 1300,
      popover: 1400,
      tooltip: 1500,
      toast: 1600
    };
    
    // Copy over any other tokens
    if (tokens.other) {
      modernTokens.custom = tokens.other;
    }
    
    return modernTokens;
  }
  
  private lightenColor(color: string, amount: number): string {
    // Simple color lightening (would use a proper color library in production)
    if (color.startsWith('#')) {
      const hex = color.substring(1);
      const rgb = parseInt(hex, 16);
      const r = Math.min(255, ((rgb >> 16) & 0xFF) + Math.round(255 * amount));
      const g = Math.min(255, ((rgb >> 8) & 0xFF) + Math.round(255 * amount));
      const b = Math.min(255, (rgb & 0xFF) + Math.round(255 * amount));
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
    return color;
  }
  
  private darkenColor(color: string, amount: number): string {
    // Simple color darkening
    if (color.startsWith('#')) {
      const hex = color.substring(1);
      const rgb = parseInt(hex, 16);
      const r = Math.max(0, ((rgb >> 16) & 0xFF) - Math.round(255 * amount));
      const g = Math.max(0, ((rgb >> 8) & 0xFF) - Math.round(255 * amount));
      const b = Math.max(0, (rgb & 0xFF) - Math.round(255 * amount));
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
    return color;
  }
  
  private getContrastColor(color: string): string {
    // Determine if white or black text would have better contrast
    if (color.startsWith('#')) {
      const hex = color.substring(1);
      const rgb = parseInt(hex, 16);
      const r = (rgb >> 16) & 0xFF;
      const g = (rgb >> 8) & 0xFF;
      const b = rgb & 0xFF;
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
    return '#000000';
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
    const variations: any = {};
    
    colors.forEach(color => {
      const cleanColor = this.normalizeColor(color);
      if (!cleanColor) return;
      
      variations[color] = {
        original: color,
        normalized: cleanColor,
        lighter: [],
        darker: [],
        complementary: null,
        analogous: [],
        triadic: []
      };
      
      // Generate tints (lighter variations)
      for (let i = 1; i <= 5; i++) {
        const amount = i * 0.15;
        variations[color].lighter.push({
          level: i,
          value: this.lightenColor(cleanColor, amount),
          amount: `${amount * 100}%`
        });
      }
      
      // Generate shades (darker variations)
      for (let i = 1; i <= 5; i++) {
        const amount = i * 0.15;
        variations[color].darker.push({
          level: i,
          value: this.darkenColor(cleanColor, amount),
          amount: `${amount * 100}%`
        });
      }
      
      // Generate complementary color
      variations[color].complementary = this.getComplementaryColor(cleanColor);
      
      // Generate analogous colors
      variations[color].analogous = [
        this.rotateHue(cleanColor, 30),
        this.rotateHue(cleanColor, -30)
      ];
      
      // Generate triadic colors
      variations[color].triadic = [
        this.rotateHue(cleanColor, 120),
        this.rotateHue(cleanColor, 240)
      ];
    });
    
    return variations;
  }
  
  private normalizeColor(color: string): string | null {
    // Normalize color to hex format
    if (color.startsWith('#')) {
      return color.length === 4 
        ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
        : color;
    }
    
    if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        const r = parseInt(match[0]);
        const g = parseInt(match[1]);
        const b = parseInt(match[2]);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
      }
    }
    
    // Handle named colors
    const namedColors: Record<string, string> = {
      white: '#ffffff',
      black: '#000000',
      red: '#ff0000',
      green: '#008000',
      blue: '#0000ff',
      yellow: '#ffff00',
      cyan: '#00ffff',
      magenta: '#ff00ff',
      gray: '#808080',
      grey: '#808080'
    };
    
    return namedColors[color.toLowerCase()] || null;
  }
  
  private getComplementaryColor(hex: string): string {
    const rgb = parseInt(hex.substring(1), 16);
    const r = (rgb >> 16) & 0xFF;
    const g = (rgb >> 8) & 0xFF;
    const b = rgb & 0xFF;
    
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    
    return `#${((compR << 16) | (compG << 8) | compB).toString(16).padStart(6, '0')}`;
  }
  
  private rotateHue(hex: string, degrees: number): string {
    // Convert hex to HSL, rotate hue, convert back
    const rgb = parseInt(hex.substring(1), 16);
    const r = ((rgb >> 16) & 0xFF) / 255;
    const g = ((rgb >> 8) & 0xFF) / 255;
    const b = (rgb & 0xFF) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    
    if (max === min) {
      // Achromatic
      return hex;
    }
    
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    let h;
    if (max === r) {
      h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }
    
    h /= 6;
    
    // Rotate hue
    h = (h + degrees / 360) % 1;
    if (h < 0) h += 1;
    
    // Convert back to RGB
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    const newR = Math.round(hue2rgb(p, q, h + 1/3) * 255);
    const newG = Math.round(hue2rgb(p, q, h) * 255);
    const newB = Math.round(hue2rgb(p, q, h - 1/3) * 255);
    
    return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`;
  }

  private checkColorAccessibility(colors: string[]) {
    const results: any = {
      pairs: [],
      wcagCompliance: {
        AA: { passed: 0, failed: 0 },
        AAA: { passed: 0, failed: 0 }
      },
      recommendations: []
    };
    
    // Check all color pairs for contrast
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const color1 = this.normalizeColor(colors[i]);
        const color2 = this.normalizeColor(colors[j]);
        
        if (!color1 || !color2) continue;
        
        const contrast = this.calculateContrastRatio(color1, color2);
        
        const pair = {
          color1: colors[i],
          color2: colors[j],
          contrast: contrast.toFixed(2),
          wcag: {
            AA_normal: contrast >= 4.5,
            AA_large: contrast >= 3,
            AAA_normal: contrast >= 7,
            AAA_large: contrast >= 4.5
          },
          usage: this.suggestUsage(contrast)
        };
        
        results.pairs.push(pair);
        
        // Update compliance counts
        if (pair.wcag.AA_normal) results.wcagCompliance.AA.passed++;
        else results.wcagCompliance.AA.failed++;
        
        if (pair.wcag.AAA_normal) results.wcagCompliance.AAA.passed++;
        else results.wcagCompliance.AAA.failed++;
      }
    }
    
    // Generate recommendations
    if (results.wcagCompliance.AA.failed > results.wcagCompliance.AA.passed) {
      results.recommendations.push('Most color pairs fail WCAG AA standards - consider adjusting contrast');
    }
    
    if (results.pairs.length > 0) {
      const avgContrast = results.pairs.reduce((sum: number, p: any) => sum + parseFloat(p.contrast), 0) / results.pairs.length;
      if (avgContrast < 4.5) {
        results.recommendations.push(`Average contrast ratio is ${avgContrast.toFixed(2)} - increase for better accessibility`);
      }
    }
    
    // Find best and worst pairs
    if (results.pairs.length > 0) {
      results.pairs.sort((a: any, b: any) => parseFloat(b.contrast) - parseFloat(a.contrast));
      results.bestPair = results.pairs[0];
      results.worstPair = results.pairs[results.pairs.length - 1];
    }
    
    return results;
  }
  
  private calculateContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getColorLuminance(color1);
    const lum2 = this.getColorLuminance(color2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  private getColorLuminance(hex: string): number {
    const rgb = parseInt(hex.substring(1), 16);
    const r = ((rgb >> 16) & 0xFF) / 255;
    const g = ((rgb >> 8) & 0xFF) / 255;
    const b = (rgb & 0xFF) / 255;
    
    // Apply gamma correction
    const gammaCorrect = (channel: number) => {
      return channel <= 0.03928
        ? channel / 12.92
        : Math.pow((channel + 0.055) / 1.055, 2.4);
    };
    
    const rCorrected = gammaCorrect(r);
    const gCorrected = gammaCorrect(g);
    const bCorrected = gammaCorrect(b);
    
    // Calculate relative luminance
    return 0.2126 * rCorrected + 0.7152 * gCorrected + 0.0722 * bCorrected;
  }
  
  private suggestUsage(contrast: number): string {
    if (contrast >= 7) return 'Excellent for all text sizes';
    if (contrast >= 4.5) return 'Good for normal text, excellent for large text';
    if (contrast >= 3) return 'Acceptable only for large text (18pt+)';
    return 'Poor contrast - avoid for text';
  }

  private analyzeGridSystem(css: any) {
    const gridInfo: any = {
      type: 'none',
      columns: 0,
      gutters: [],
      breakpoints: [],
      gridTemplates: [],
      flexContainers: [],
      customGrids: []
    };
    
    if (css.inline) {
      css.inline.forEach((style: string) => {
        // Check for CSS Grid
        const gridTemplateRegex = /grid-template-columns:\s*([^;]+)/gi;
        let match;
        while ((match = gridTemplateRegex.exec(style)) !== null) {
          const template = match[1].trim();
          gridInfo.gridTemplates.push(template);
          
          // Analyze grid template
          if (template.includes('repeat')) {
            const repeatMatch = /repeat\((\d+|auto-[^,]+),\s*([^)]+)\)/.exec(template);
            if (repeatMatch) {
              gridInfo.type = 'css-grid';
              if (!isNaN(parseInt(repeatMatch[1]))) {
                gridInfo.columns = Math.max(gridInfo.columns, parseInt(repeatMatch[1]));
              }
            }
          } else {
            const columns = template.split(/\s+/).filter(c => c && c !== 'auto');
            gridInfo.columns = Math.max(gridInfo.columns, columns.length);
            gridInfo.type = 'css-grid';
          }
        }
        
        // Check for grid gaps
        const gapRegex = /(?:grid-)?gap:\s*([^;]+)/gi;
        while ((match = gapRegex.exec(style)) !== null) {
          gridInfo.gutters.push(match[1].trim());
        }
        
        // Check for Flexbox
        const flexRegex = /display:\s*flex/gi;
        if (flexRegex.test(style)) {
          const flexContainer: any = {
            type: 'flexbox',
            properties: {}
          };
          
          // Extract flex properties
          const flexDirectionMatch = /flex-direction:\s*([^;]+)/.exec(style);
          if (flexDirectionMatch) flexContainer.properties.direction = flexDirectionMatch[1]!.trim();
          
          const justifyMatch = /justify-content:\s*([^;]+)/.exec(style);
          if (justifyMatch) flexContainer.properties.justify = justifyMatch[1]!.trim();
          
          const alignMatch = /align-items:\s*([^;]+)/.exec(style);
          if (alignMatch) flexContainer.properties.align = alignMatch[1]!.trim();
          
          const wrapMatch = /flex-wrap:\s*([^;]+)/.exec(style);
          if (wrapMatch) flexContainer.properties.wrap = wrapMatch[1]!.trim();
          
          gridInfo.flexContainers.push(flexContainer);
          if (gridInfo.type === 'none') gridInfo.type = 'flexbox';
        }
        
        // Check for Bootstrap-style grid
        const colRegex = /\.col-(?:xs|sm|md|lg|xl)?-?(\d+)/gi;
        while ((match = colRegex.exec(style)) !== null) {
          if (gridInfo.type === 'none') gridInfo.type = 'bootstrap';
          gridInfo.columns = 12; // Bootstrap uses 12-column grid
        }
        
        // Check for custom grid systems
        const customGridRegex = /\.(?:grid|row|column)[^{]*\{[^}]*width:\s*([\d.]+%)/gi;
        while ((match = customGridRegex.exec(style)) !== null) {
          const width = parseFloat(match[1]!);
          if (width > 0) {
            const possibleColumns = Math.round(100 / width);
            if (possibleColumns > 0 && possibleColumns <= 24) {
              gridInfo.customGrids.push({
                width: `${width}%`,
                estimatedColumns: possibleColumns
              });
              if (gridInfo.type === 'none') gridInfo.type = 'custom';
            }
          }
        }
      });
    }
    
    // Determine most likely grid system
    if (gridInfo.gridTemplates.length > 0) {
      gridInfo.type = 'css-grid';
      gridInfo.features = {
        modern: true,
        responsive: gridInfo.gridTemplates.some(t => t.includes('minmax') || t.includes('auto'))
      };
    } else if (gridInfo.flexContainers.length > 0 && gridInfo.type !== 'bootstrap') {
      gridInfo.type = 'flexbox';
      gridInfo.features = {
        modern: true,
        direction: gridInfo.flexContainers[0]?.properties?.direction || 'row'
      };
    } else if (gridInfo.columns === 12) {
      gridInfo.type = 'bootstrap';
      gridInfo.features = {
        framework: 'bootstrap',
        columns: 12
      };
    }
    
    // Clean up gutters
    gridInfo.gutters = [...new Set(gridInfo.gutters)];
    
    return gridInfo;
  }

  private analyzeSpacingSystem(css: any) {
    const spacingInfo: any = {
      baseUnit: null,
      scale: [],
      patterns: [],
      margins: [],
      paddings: [],
      gaps: [],
      consistency: {
        score: 0,
        issues: []
      }
    };
    
    const spacingValues = new Map();
    
    if (css.inline) {
      css.inline.forEach((style: string) => {
        // Extract margin values
        const marginRegex = /margin(?:-(?:top|right|bottom|left))?:\s*([^;]+)/gi;
        let match;
        while ((match = marginRegex.exec(style)) !== null) {
          const value = match[1].trim();
          if (value !== 'auto' && value !== '0') {
            spacingInfo.margins.push(value);
            this.trackSpacingValue(spacingValues, value);
          }
        }
        
        // Extract padding values
        const paddingRegex = /padding(?:-(?:top|right|bottom|left))?:\s*([^;]+)/gi;
        while ((match = paddingRegex.exec(style)) !== null) {
          const value = match[1].trim();
          if (value !== '0') {
            spacingInfo.paddings.push(value);
            this.trackSpacingValue(spacingValues, value);
          }
        }
        
        // Extract gap values
        const gapRegex = /(?:grid-)?gap:\s*([^;]+)/gi;
        while ((match = gapRegex.exec(style)) !== null) {
          const value = match[1].trim();
          spacingInfo.gaps.push(value);
          this.trackSpacingValue(spacingValues, value);
        }
      });
    }
    
    // Analyze spacing values to find patterns
    const numericValues: number[] = [];
    spacingValues.forEach((count, value) => {
      const numeric = this.parseSpacingValue(value);
      if (numeric !== null) {
        numericValues.push(numeric);
        spacingInfo.patterns.push({
          value,
          count,
          numeric,
          unit: this.getSpacingUnit(value)
        });
      }
    });
    
    // Determine base unit and scale
    if (numericValues.length > 0) {
      numericValues.sort((a, b) => a - b);
      
      // Find GCD to determine base unit
      const gcd = this.findGCD(numericValues);
      if (gcd > 1 && gcd <= 16) {
        spacingInfo.baseUnit = gcd;
        
        // Build scale based on base unit
        const scale = new Set();
        numericValues.forEach(val => {
          const multiple = Math.round(val / gcd);
          if (multiple > 0 && multiple <= 20) {
            scale.add(multiple * gcd);
          }
        });
        spacingInfo.scale = Array.from(scale).sort((a, b) => a - b);
        
        // Check consistency
        const expectedScale = [4, 8, 12, 16, 24, 32, 48, 64];
        const matchingValues = spacingInfo.scale.filter(v => expectedScale.includes(v));
        spacingInfo.consistency.score = (matchingValues.length / expectedScale.length) * 100;
        
        if (spacingInfo.consistency.score < 50) {
          spacingInfo.consistency.issues.push('Spacing values do not follow a consistent scale');
        }
      } else {
        // No clear base unit found
        spacingInfo.baseUnit = null;
        spacingInfo.consistency.issues.push('No clear base unit detected in spacing system');
      }
      
      // Detect common spacing patterns
      if (numericValues.some(v => v % 8 === 0)) {
        spacingInfo.patterns.push({
          type: '8px-grid',
          description: 'Uses 8px grid system',
          confidence: 'high'
        });
      }
      
      if (numericValues.some(v => v % 4 === 0)) {
        spacingInfo.patterns.push({
          type: '4px-grid',
          description: 'Uses 4px grid system',
          confidence: 'medium'
        });
      }
    }
    
    // Remove duplicates
    spacingInfo.margins = [...new Set(spacingInfo.margins)];
    spacingInfo.paddings = [...new Set(spacingInfo.paddings)];
    spacingInfo.gaps = [...new Set(spacingInfo.gaps)];
    
    // Add recommendations
    spacingInfo.recommendations = [];
    if (!spacingInfo.baseUnit) {
      spacingInfo.recommendations.push('Consider adopting a consistent spacing scale (e.g., 4px or 8px base)');
    }
    if (spacingInfo.margins.length > 10) {
      spacingInfo.recommendations.push('Too many margin variations - consider standardizing');
    }
    if (spacingInfo.paddings.length > 10) {
      spacingInfo.recommendations.push('Too many padding variations - consider standardizing');
    }
    
    return spacingInfo;
  }
  
  private trackSpacingValue(map: Map<string, number>, value: string) {
    const values = value.split(/\s+/);
    values.forEach(v => {
      if (v && v !== 'auto' && v !== '0') {
        map.set(v, (map.get(v) || 0) + 1);
      }
    });
  }
  
  private parseSpacingValue(value: string): number | null {
    const match = value.match(/^([\d.]+)(?:px|rem|em)?$/);
    if (match) {
      const num = parseFloat(match[1]);
      if (value.includes('rem')) return num * 16; // Assume 16px base
      if (value.includes('em')) return num * 16; // Assume 16px base
      return num;
    }
    return null;
  }
  
  private getSpacingUnit(value: string): string {
    if (value.includes('px')) return 'px';
    if (value.includes('rem')) return 'rem';
    if (value.includes('em')) return 'em';
    if (value.includes('%')) return '%';
    return 'unitless';
  }
  
  private findGCD(numbers: number[]): number {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    return numbers.reduce((acc, num) => gcd(acc, num));
  }

  private analyzeBreakpoints(css: any) {
    const breakpoints: any[] = [];
    const breakpointMap = new Map();
    
    if (css.inline) {
      css.inline.forEach((style: string) => {
        // Extract media queries
        const mediaRegex = /@media[^{]+\{/gi;
        let match;
        while ((match = mediaRegex.exec(style)) !== null) {
          const mediaQuery = match[0];
          const breakpoint: any = {
            query: mediaQuery.replace('{', '').trim(),
            type: 'custom',
            value: null,
            unit: null,
            direction: null
          };
          
          // Extract min-width breakpoints
          const minWidthMatch = /min-width:\s*([\d.]+)(px|em|rem)/i.exec(mediaQuery);
          if (minWidthMatch) {
            breakpoint.value = parseFloat(minWidthMatch[1]);
            breakpoint.unit = minWidthMatch[2];
            breakpoint.direction = 'min';
            
            // Convert to pixels for consistency
            let pxValue = breakpoint.value;
            if (breakpoint.unit === 'em' || breakpoint.unit === 'rem') {
              pxValue = breakpoint.value * 16;
            }
            
            // Identify common breakpoint types
            if (pxValue >= 320 && pxValue <= 480) breakpoint.type = 'mobile';
            else if (pxValue >= 481 && pxValue <= 768) breakpoint.type = 'tablet';
            else if (pxValue >= 769 && pxValue <= 1024) breakpoint.type = 'desktop';
            else if (pxValue >= 1025 && pxValue <= 1440) breakpoint.type = 'wide';
            else if (pxValue > 1440) breakpoint.type = 'ultra-wide';
            
            const key = `${breakpoint.direction}-${pxValue}`;
            if (!breakpointMap.has(key)) {
              breakpointMap.set(key, breakpoint);
            }
          }
          
          // Extract max-width breakpoints
          const maxWidthMatch = /max-width:\s*([\d.]+)(px|em|rem)/i.exec(mediaQuery);
          if (maxWidthMatch) {
            breakpoint.value = parseFloat(maxWidthMatch[1]);
            breakpoint.unit = maxWidthMatch[2];
            breakpoint.direction = 'max';
            
            let pxValue = breakpoint.value;
            if (breakpoint.unit === 'em' || breakpoint.unit === 'rem') {
              pxValue = breakpoint.value * 16;
            }
            
            if (pxValue <= 480) breakpoint.type = 'mobile';
            else if (pxValue <= 768) breakpoint.type = 'tablet';
            else if (pxValue <= 1024) breakpoint.type = 'desktop';
            else breakpoint.type = 'wide';
            
            const key = `${breakpoint.direction}-${pxValue}`;
            if (!breakpointMap.has(key)) {
              breakpointMap.set(key, breakpoint);
            }
          }
          
          // Check for orientation queries
          if (mediaQuery.includes('orientation')) {
            const orientationMatch = /orientation:\s*(portrait|landscape)/i.exec(mediaQuery);
            if (orientationMatch) {
              breakpoint.orientation = orientationMatch[1];
            }
          }
          
          // Check for device-specific queries
          if (mediaQuery.includes('device')) {
            breakpoint.deviceSpecific = true;
          }
        }
      });
    }
    
    // Convert map to array and sort by value
    breakpointMap.forEach(bp => breakpoints.push(bp));
    breakpoints.sort((a, b) => {
      if (!a.value || !b.value) return 0;
      return a.value - b.value;
    });
    
    // Analyze breakpoint system
    const analysis: any = {
      breakpoints,
      system: 'custom',
      mobileFirst: false,
      desktopFirst: false,
      consistency: 'unknown'
    };
    
    if (breakpoints.length > 0) {
      // Check if mobile-first or desktop-first
      const minBreakpoints = breakpoints.filter(bp => bp.direction === 'min');
      const maxBreakpoints = breakpoints.filter(bp => bp.direction === 'max');
      
      if (minBreakpoints.length > maxBreakpoints.length) {
        analysis.mobileFirst = true;
        analysis.approach = 'mobile-first';
      } else if (maxBreakpoints.length > minBreakpoints.length) {
        analysis.desktopFirst = true;
        analysis.approach = 'desktop-first';
      } else {
        analysis.approach = 'mixed';
      }
      
      // Check for common breakpoint systems
      const values = breakpoints.map(bp => bp.value).filter(v => v);
      
      // Bootstrap breakpoints
      const bootstrapBreakpoints = [576, 768, 992, 1200, 1400];
      if (values.some(v => bootstrapBreakpoints.includes(v))) {
        analysis.system = 'bootstrap';
      }
      
      // Tailwind breakpoints
      const tailwindBreakpoints = [640, 768, 1024, 1280, 1536];
      if (values.some(v => tailwindBreakpoints.includes(v))) {
        analysis.system = 'tailwind';
      }
      
      // Check consistency
      if (values.length >= 3) {
        const differences: number[] = [];
        for (let i = 1; i < values.length; i++) {
          differences.push(values[i] - values[i - 1]);
        }
        
        const avgDiff = differences.reduce((a, b) => a + b, 0) / differences.length;
        const variance = differences.reduce((sum, diff) => sum + Math.pow(diff - avgDiff, 2), 0) / differences.length;
        
        if (variance < 10000) {
          analysis.consistency = 'high';
        } else if (variance < 50000) {
          analysis.consistency = 'medium';
        } else {
          analysis.consistency = 'low';
        }
      }
    }
    
    return analysis;
  }

  private identifyLayoutPatterns(data: any) {
    const patterns: any[] = [];
    const detectedPatterns = new Set<string>();
    
    if (data.structure) {
      // Check for header patterns
      const hasHeader = data.structure.sections?.some((s: any) => 
        s.tag === 'header' || s.class?.includes('header')
      );
      
      if (data.structure.navigation && data.structure.navigation.length > 0 && hasHeader) {
        detectedPatterns.add('Header with Navigation');
        patterns.push({
          type: 'header-nav',
          confidence: 'high',
          details: 'Standard header with navigation menu'
        });
      }
      
      // Check for footer patterns
      const hasFooter = data.structure.sections?.some((s: any) => 
        s.tag === 'footer' || s.class?.includes('footer')
      );
      if (hasFooter) {
        detectedPatterns.add('Footer Section');
        patterns.push({
          type: 'footer',
          confidence: 'high',
          details: 'Standard footer section'
        });
      }
      
      // Check for main content area
      const hasMain = data.structure.sections?.some((s: any) => 
        s.tag === 'main' || s.class?.includes('main') || s.class?.includes('content')
      );
      
      // Header-Main-Footer pattern
      if (hasHeader && hasMain && hasFooter) {
        detectedPatterns.add('Header-Main-Footer');
        patterns.push({
          type: 'header-main-footer',
          confidence: 'high',
          details: 'Classic three-part layout structure'
        });
      }
      
      // Check for sidebar patterns
      const hasSidebar = data.structure.sections?.some((s: any) => 
        s.tag === 'aside' || 
        s.class?.includes('sidebar') || 
        s.class?.includes('aside')
      );
      if (hasSidebar) {
        detectedPatterns.add('Sidebar Layout');
        patterns.push({
          type: 'sidebar',
          confidence: 'high',
          details: hasMain ? 'Main content with sidebar' : 'Sidebar detected'
        });
      }
      
      // Check for hero section
      const hasHero = data.structure.sections?.some((s: any) => 
        s.class?.includes('hero') || 
        s.class?.includes('banner') ||
        s.class?.includes('jumbotron')
      );
      if (hasHero) {
        detectedPatterns.add('Hero Section');
        patterns.push({
          type: 'hero',
          confidence: 'high',
          details: 'Hero/banner section for prominent content'
        });
      }
    }
    
    // Analyze markdown content for patterns
    if (data.markdown) {
      // Check for grid layouts
      if (data.markdown.includes('grid') || data.markdown.includes('row') || data.markdown.includes('col-')) {
        detectedPatterns.add('Grid Layout');
        patterns.push({
          type: 'grid',
          confidence: 'medium',
          details: 'Grid-based layout system detected'
        });
      }
      
      // Check for card grids
      if (data.markdown.includes('card') && (data.markdown.includes('grid') || data.markdown.includes('flex'))) {
        detectedPatterns.add('Card Grid');
        patterns.push({
          type: 'card-grid',
          confidence: 'medium',
          details: 'Card-based grid layout'
        });
      }
      
      // Check for form layouts
      if (data.markdown.includes('<form')) {
        patterns.push({
          type: 'form-layout',
          confidence: 'high',
          details: 'Form-based layout section'
        });
      }
      
      // Check for modal/dialog patterns
      if (data.markdown.includes('modal') || data.markdown.includes('dialog') || data.markdown.includes('popup')) {
        patterns.push({
          type: 'modal',
          confidence: 'medium',
          details: 'Modal/dialog overlay pattern'
        });
      }
      
      // Check for tab patterns
      if (data.markdown.includes('tab') && (data.markdown.includes('panel') || data.markdown.includes('content'))) {
        patterns.push({
          type: 'tabs',
          confidence: 'medium',
          details: 'Tabbed content interface'
        });
      }
      
      // Check for accordion patterns
      if (data.markdown.includes('accordion') || data.markdown.includes('collapse') || data.markdown.includes('expand')) {
        patterns.push({
          type: 'accordion',
          confidence: 'medium',
          details: 'Collapsible/expandable content sections'
        });
      }
    }
    
    // Analyze CSS for layout patterns
    if (data.design && data.design.css) {
      data.design.css.inline?.forEach((css: string) => {
        // Check for flexbox layouts
        if (css.includes('display: flex') || css.includes('display:flex')) {
          patterns.push({
            type: 'flexbox',
            confidence: 'high',
            details: 'Flexbox-based layout'
          });
        }
        
        // Check for CSS Grid
        if (css.includes('display: grid') || css.includes('display:grid')) {
          patterns.push({
            type: 'css-grid',
            confidence: 'high',
            details: 'CSS Grid layout system'
          });
        }
        
        // Check for sticky elements
        if (css.includes('position: sticky') || css.includes('position:sticky')) {
          patterns.push({
            type: 'sticky-elements',
            confidence: 'high',
            details: 'Sticky positioned elements'
          });
        }
        
        // Check for fixed elements
        if (css.includes('position: fixed') || css.includes('position:fixed')) {
          patterns.push({
            type: 'fixed-elements',
            confidence: 'high',
            details: 'Fixed positioned elements (possibly header/nav)'
          });
        }
      });
    }
    
    // Add summary
    const summary = {
      type: 'summary',
      total_patterns: patterns.length,
      detected: Array.from(detectedPatterns),
      layout_type: this.determineLayoutType(patterns),
      complexity: patterns.length > 5 ? 'complex' : patterns.length > 2 ? 'moderate' : 'simple'
    };
    
    patterns.unshift(summary);
    
    return patterns;
  }
  
  private determineLayoutType(patterns: any[]): string {
    const types = patterns.map(p => p.type);
    
    if (types.includes('header-main-footer') && types.includes('sidebar')) {
      return 'Traditional with Sidebar';
    }
    if (types.includes('hero') && types.includes('card-grid')) {
      return 'Modern Landing Page';
    }
    if (types.includes('css-grid') || types.includes('flexbox')) {
      return 'Modern Responsive';
    }
    if (types.includes('header-main-footer')) {
      return 'Traditional';
    }
    if (types.includes('grid')) {
      return 'Grid-based';
    }
    
    return 'Custom';
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