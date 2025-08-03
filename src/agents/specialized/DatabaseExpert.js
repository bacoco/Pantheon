import { PantheonAgent } from '../PantheonAgent.js';
import path from 'path';

/**
 * DatabaseExpert - Specialized agent for database operations and optimization
 * Expert in database design, queries, migrations, performance optimization, and data modeling
 */
export class DatabaseExpert extends PantheonAgent {
  constructor(config = {}) {
    super({
      name: 'database-expert',
      description: 'Database specialist with expertise in design, optimization, migrations, and data modeling',
      model: config.model || 'claude-sonnet',
      tools: [
        'Edit', 'Read', 'Write', 'Grep', 'Glob', 'Bash'
      ],
      collaboration_mode: 'specialist',
      specialization: 'database_operations',
      code_writing: 'ALLOWED',
      validation_required: true,
      auto_validation: true,
      ...config
    });
    
    // Database systems and technologies
    this.databaseSystems = {
      relational: {
        postgresql: {
          orms: ['sequelize', 'typeorm', 'prisma', 'knex'],
          features: ['jsonb', 'arrays', 'triggers', 'views', 'stored_procedures'],
          extensions: ['postgis', 'uuid-ossp', 'pg_stat_statements']
        },
        mysql: {
          orms: ['sequelize', 'typeorm', 'prisma', 'mysql2'],
          features: ['json', 'triggers', 'views', 'stored_procedures'],
          extensions: ['full_text_search']
        },
        sqlite: {
          orms: ['sequelize', 'better-sqlite3', 'sqlite3'],
          features: ['json1', 'fts5', 'rtree'],
          extensions: ['sqlite-utils']
        }
      },
      nosql: {
        mongodb: {
          orms: ['mongoose', 'mongodb-native'],
          features: ['aggregation', 'indexing', 'sharding', 'replica_sets'],
          tools: ['compass', 'atlas']
        },
        redis: {
          clients: ['redis', 'ioredis'],
          features: ['pub_sub', 'lua_scripts', 'streams', 'modules'],
          tools: ['redis-insight', 'redis-cli']
        },
        elasticsearch: {
          clients: ['elasticsearch-js', '@elastic/elasticsearch'],
          features: ['full_text_search', 'aggregations', 'mapping'],
          tools: ['kibana', 'logstash']
        }
      },
      cloud: {
        aws: ['rds', 'dynamodb', 'aurora', 'documentdb', 'elasticache'],
        azure: ['sql-database', 'cosmos-db', 'cache-for-redis'],
        gcp: ['cloud-sql', 'firestore', 'bigtable', 'memorystore']
      }
    };
    
    // Database design patterns
    this.designPatterns = {
      normalization: ['1nf', '2nf', '3nf', 'bcnf', 'denormalization'],
      relationships: ['one_to_one', 'one_to_many', 'many_to_many', 'self_referential'],
      indexing: ['btree', 'hash', 'gin', 'gist', 'composite', 'partial'],
      partitioning: ['horizontal', 'vertical', 'functional', 'time_based'],
      sharding: ['key_based', 'directory_based', 'range_based']
    };
    
    // Performance optimization techniques
    this.optimizationTechniques = {
      queries: ['explain_plans', 'index_optimization', 'query_rewriting', 'materialized_views'],
      caching: ['query_caching', 'result_caching', 'connection_pooling', 'redis_caching'],
      scaling: ['read_replicas', 'master_slave', 'clustering', 'load_balancing'],
      monitoring: ['slow_query_log', 'performance_schema', 'query_analyzer']
    };
    
    // Migration strategies
    this.migrationStrategies = {
      versioning: ['sequential', 'timestamp', 'semantic'],
      rollback: ['down_migrations', 'snapshots', 'blue_green'],
      data_migration: ['batch_processing', 'streaming', 'zero_downtime']
    };
  }
  
  /**
   * Main task execution for database-related tasks
   */
  async performTask(task) {
    const { type, schema, database, requirements } = task;
    
    this.logger.info('DatabaseExpert executing task', { 
      type, 
      database: database || 'auto-detect',
      complexity: requirements?.complexity || 'medium'
    });
    
    switch (type) {
      case 'design_schema':
        return await this.designDatabaseSchema(requirements, database);
      case 'create_migrations':
        return await this.createMigrations(schema, database);
      case 'optimize_queries':
        return await this.optimizeQueries(task.queries, database);
      case 'setup_database':
        return await this.setupDatabase(requirements, database);
      case 'create_models':
        return await this.createModels(schema, task.orm, database);
      case 'performance_audit':
        return await this.performanceAudit(task.connection, database);
      case 'backup_strategy':
        return await this.createBackupStrategy(requirements, database);
      case 'monitoring_setup':
        return await this.setupMonitoring(requirements, database);
      case 'data_seeding':
        return await this.createDataSeeding(task.seedData, database);
      case 'security_hardening':
        return await this.securityHardening(requirements, database);
      case 'scaling_strategy':
        return await this.createScalingStrategy(requirements, database);
      case 'data_migration':
        return await this.createDataMigration(task.source, task.target, requirements);
      default:
        throw new Error(`Unknown database task type: ${type}`);
    }
  }
  
  /**
   * Design database schema based on requirements
   */
  async designDatabaseSchema(requirements, databaseType) {
    try {
      this.logger.info('Designing database schema', { databaseType, entities: requirements.entities?.length });
      
      // Analyze requirements
      const analysis = await this.analyzeSchemaRequirements(requirements);
      
      // Select optimal database type
      const selectedDB = databaseType || await this.selectOptimalDatabase(analysis);
      
      // Design schema
      const schema = await this.generateSchema(analysis, selectedDB);
      
      // Create migrations
      const migrations = await this.generateMigrations(schema, selectedDB);
      
      // Generate models/entities
      const models = await this.generateModels(schema, analysis.orm, selectedDB);
      
      // Create indexes
      const indexes = await this.designIndexes(schema, analysis.queries);
      
      // Generate documentation
      const documentation = await this.generateSchemaDocumentation(schema, analysis);
      
      return {
        success: true,
        database: selectedDB,
        schema,
        migrations,
        models,
        indexes,
        documentation,
        recommendations: await this.generateSchemaRecommendations(analysis, selectedDB)
      };
      
    } catch (error) {
      this.logger.error('Failed to design schema', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Analyze schema requirements
   */
  async analyzeSchemaRequirements(requirements) {
    const analysis = {
      entities: [],
      relationships: [],
      queries: [],
      constraints: [],
      performance: 'medium',
      scalability: 'medium',
      orm: null,
      features: []
    };
    
    // Analyze entities
    if (requirements.entities) {
      analysis.entities = requirements.entities.map(entity => ({
        name: entity.name,
        fields: this.analyzeEntityFields(entity.fields || entity.properties),
        relationships: entity.relationships || [],
        constraints: entity.constraints || [],
        indexes: entity.indexes || []
      }));
    }
    
    // Extract relationships
    analysis.relationships = this.extractRelationships(analysis.entities);
    
    // Analyze query patterns
    analysis.queries = this.analyzeQueryPatterns(requirements.queries || []);
    
    // Determine performance requirements
    analysis.performance = requirements.performance || 'medium';
    analysis.scalability = requirements.scalability || 'medium';
    
    // Select ORM
    analysis.orm = requirements.orm || await this.selectOptimalORM(requirements);
    
    // Extract features
    analysis.features = this.extractDatabaseFeatures(requirements);
    
    return analysis;
  }
  
  /**
   * Generate database schema
   */
  async generateSchema(analysis, databaseType) {
    const schema = {
      database: databaseType,
      tables: [],
      relationships: [],
      indexes: [],
      constraints: []
    };
    
    // Generate tables
    for (const entity of analysis.entities) {
      const table = await this.generateTable(entity, databaseType);
      schema.tables.push(table);
    }
    
    // Generate relationships
    for (const relationship of analysis.relationships) {
      const relation = await this.generateRelationship(relationship, databaseType);
      schema.relationships.push(relation);
    }
    
    // Generate indexes
    schema.indexes = await this.generateIndexes(analysis.entities, analysis.queries, databaseType);
    
    // Generate constraints
    schema.constraints = await this.generateConstraints(analysis.entities, databaseType);
    
    return schema;
  }
  
  /**
   * Generate table definition
   */
  async generateTable(entity, databaseType) {
    const table = {
      name: entity.name.toLowerCase(),
      fields: [],
      primaryKey: 'id',
      timestamps: true
    };
    
    // Add ID field
    table.fields.push({
      name: 'id',
      type: this.getIdType(databaseType),
      primaryKey: true,
      autoIncrement: true,
      nullable: false
    });
    
    // Add entity fields
    for (const field of entity.fields) {
      table.fields.push({
        name: field.name,
        type: this.mapFieldType(field.type, databaseType),
        nullable: !field.required,
        unique: field.unique || false,
        default: field.default,
        length: field.length,
        precision: field.precision,
        scale: field.scale
      });
    }
    
    // Add timestamp fields
    if (table.timestamps) {
      table.fields.push(
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          nullable: false,
          default: 'CURRENT_TIMESTAMP'
        },
        {
          name: 'updated_at',
          type: 'TIMESTAMP',
          nullable: false,
          default: 'CURRENT_TIMESTAMP'
        }
      );
    }
    
    return table;
  }
  
  /**
   * Generate migrations
   */
  async generateMigrations(schema, databaseType) {
    const migrations = [];
    
    // Create tables migration
    const createTablesMigration = await this.generateCreateTablesMigration(schema.tables, databaseType);
    migrations.push(createTablesMigration);
    
    // Create relationships migration
    if (schema.relationships.length > 0) {
      const relationshipsMigration = await this.generateRelationshipsMigration(schema.relationships, databaseType);
      migrations.push(relationshipsMigration);
    }
    
    // Create indexes migration
    if (schema.indexes.length > 0) {
      const indexesMigration = await this.generateIndexesMigration(schema.indexes, databaseType);
      migrations.push(indexesMigration);
    }
    
    return migrations;
  }
  
  /**
   * Generate create tables migration
   */
  async generateCreateTablesMigration(tables, databaseType) {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const fileName = `${timestamp}_create_tables.sql`;
    
    let migrationSQL = `-- Migration: Create Tables\n-- Generated at: ${new Date().toISOString()}\n\n`;
    
    for (const table of tables) {
      migrationSQL += this.generateCreateTableSQL(table, databaseType) + '\n\n';
    }
    
    return {
      fileName,
      content: migrationSQL,
      type: 'create_tables'
    };
  }
  
  /**
   * Generate CREATE TABLE SQL
   */
  generateCreateTableSQL(table, databaseType) {
    let sql = `CREATE TABLE ${table.name} (\n`;
    
    const fieldDefinitions = table.fields.map(field => {
      let definition = `  ${field.name} ${field.type}`;
      
      if (field.length) {
        definition += `(${field.length})`;
      } else if (field.precision) {
        definition += `(${field.precision}${field.scale ? ',' + field.scale : ''})`;
      }
      
      if (field.primaryKey) {
        definition += ' PRIMARY KEY';
      }
      
      if (field.autoIncrement && databaseType === 'postgresql') {
        definition = `  ${field.name} SERIAL PRIMARY KEY`;
      } else if (field.autoIncrement && databaseType === 'mysql') {
        definition += ' AUTO_INCREMENT';
      }
      
      if (!field.nullable) {
        definition += ' NOT NULL';
      }
      
      if (field.unique && !field.primaryKey) {
        definition += ' UNIQUE';
      }
      
      if (field.default !== undefined) {
        definition += ` DEFAULT ${this.formatDefaultValue(field.default, field.type)}`;
      }
      
      return definition;
    });
    
    sql += fieldDefinitions.join(',\n');
    sql += '\n);';
    
    // Add table comments
    if (databaseType === 'postgresql') {
      sql += `\n\nCOMMENT ON TABLE ${table.name} IS 'Generated by Pantheon DatabaseExpert';`;
    }
    
    return sql;
  }
  
  /**
   * Generate models/entities for ORM
   */
  async generateModels(schema, orm, databaseType) {
    const models = {};
    
    for (const table of schema.tables) {
      const modelName = this.toPascalCase(table.name);
      const fileName = `models/${modelName}.js`;
      
      switch (orm) {
        case 'sequelize':
          models[fileName] = this.generateSequelizeModel(table, schema);
          break;
        case 'typeorm':
          models[fileName.replace('.js', '.ts')] = this.generateTypeORMModel(table, schema);
          break;
        case 'prisma':
          models['prisma/schema.prisma'] = this.generatePrismaSchema(schema);
          break;
        case 'mongoose':
          models[fileName] = this.generateMongooseModel(table);
          break;
        default:
          models[fileName] = this.generateSequelizeModel(table, schema);
      }
    }
    
    return models;
  }
  
  /**
   * Generate Sequelize model
   */
  generateSequelizeModel(table, schema) {
    const modelName = this.toPascalCase(table.name);
    const tableName = table.name;
    
    let modelCode = `const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ${modelName} = sequelize.define('${modelName}', {
`;
    
    // Generate field definitions
    const fields = table.fields
      .filter(field => !['id', 'created_at', 'updated_at'].includes(field.name))
      .map(field => {
        let fieldDef = `  ${field.name}: {
    type: DataTypes.${this.mapToSequelizeType(field.type)}`;
        
        if (field.length) {
          fieldDef += `(${field.length})`;
        }
        
        if (!field.nullable) {
          fieldDef += ',\n    allowNull: false';
        }
        
        if (field.unique) {
          fieldDef += ',\n    unique: true';
        }
        
        if (field.default !== undefined) {
          fieldDef += `,\n    defaultValue: ${JSON.stringify(field.default)}`;
        }
        
        fieldDef += '\n  }';
        return fieldDef;
      });
    
    modelCode += fields.join(',\n');
    
    modelCode += `
}, {
  tableName: '${tableName}',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
${this.generateSequelizeAssociations(table, schema)}

module.exports = ${modelName};`;
    
    return modelCode;
  }
  
  /**
   * Optimize database queries
   */
  async optimizeQueries(queries, databaseType) {
    const optimizations = [];
    
    for (const query of queries) {
      const optimization = await this.analyzeAndOptimizeQuery(query, databaseType);
      optimizations.push(optimization);
    }
    
    return {
      success: true,
      optimizations,
      recommendations: this.generateQueryOptimizationRecommendations(optimizations),
      indexSuggestions: this.suggestIndexes(queries)
    };
  }
  
  /**
   * Analyze and optimize a single query
   */
  async analyzeAndOptimizeQuery(query, databaseType) {
    const analysis = {
      original: query,
      issues: [],
      optimized: null,
      performance_gain: null,
      index_suggestions: []
    };
    
    // Detect common issues
    analysis.issues = this.detectQueryIssues(query);
    
    // Generate optimized version
    analysis.optimized = this.optimizeQuery(query, analysis.issues);
    
    // Suggest indexes
    analysis.index_suggestions = this.suggestQueryIndexes(query);
    
    // Estimate performance gain
    analysis.performance_gain = this.estimatePerformanceGain(analysis.issues);
    
    return analysis;
  }
  
  /**
   * Setup database infrastructure
   */
  async setupDatabase(requirements, databaseType) {
    const setup = {
      configuration: {},
      scripts: {},
      docker: {},
      monitoring: {}
    };
    
    // Generate database configuration
    setup.configuration = await this.generateDatabaseConfig(requirements, databaseType);
    
    // Generate setup scripts
    setup.scripts = await this.generateSetupScripts(requirements, databaseType);
    
    // Generate Docker configuration
    setup.docker = await this.generateDockerConfig(requirements, databaseType);
    
    // Generate monitoring setup
    setup.monitoring = await this.generateMonitoringConfig(requirements, databaseType);
    
    return {
      success: true,
      database: databaseType,
      setup,
      documentation: this.generateDatabaseSetupDocumentation(setup, databaseType)
    };
  }
  
  /**
   * Generate database configuration
   */
  async generateDatabaseConfig(requirements, databaseType) {
    const configs = {};
    
    switch (databaseType) {
      case 'postgresql':
        configs['config/database.js'] = this.generatePostgreSQLConfig(requirements);
        configs['config/postgresql.conf'] = this.generatePostgreSQLServerConfig(requirements);
        break;
      case 'mysql':
        configs['config/database.js'] = this.generateMySQLConfig(requirements);
        configs['config/my.cnf'] = this.generateMySQLServerConfig(requirements);
        break;
      case 'mongodb':
        configs['config/database.js'] = this.generateMongoDBConfig(requirements);
        configs['config/mongod.conf'] = this.generateMongoDBServerConfig(requirements);
        break;
    }
    
    return configs;
  }
  
  /**
   * Generate PostgreSQL configuration
   */
  generatePostgreSQLConfig(requirements) {
    return `const { Sequelize } = require('sequelize');

const config = {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'app_development',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  },
  test: {
    username: process.env.TEST_DB_USERNAME || 'postgres',
    password: process.env.TEST_DB_PASSWORD || '',
    database: process.env.TEST_DB_NAME || 'app_test',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[env]);

module.exports = {
  config,
  sequelize,
  Sequelize
};`;
  }
  
  /**
   * Generate Docker configuration
   */
  generateDockerConfig(requirements, databaseType) {
    const configs = {};
    
    configs['docker-compose.yml'] = this.generateDockerCompose(requirements, databaseType);
    configs['Dockerfile.db'] = this.generateDatabaseDockerfile(databaseType);
    configs['.dockerignore'] = this.generateDockerIgnore();
    
    return configs;
  }
  
  /**
   * Generate Docker Compose file
   */
  generateDockerCompose(requirements, databaseType) {
    switch (databaseType) {
      case 'postgresql':
        return `version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: app_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: \${DB_NAME:-app_development}
      POSTGRES_USER: \${DB_USERNAME:-postgres}
      POSTGRES_PASSWORD: \${DB_PASSWORD:-password}
    ports:
      - "\${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USERNAME:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: app_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  postgres_data:
  redis_data:`;
      
      case 'mysql':
        return `version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: app_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: \${DB_ROOT_PASSWORD:-rootpassword}
      MYSQL_DATABASE: \${DB_NAME:-app_development}
      MYSQL_USER: \${DB_USERNAME:-app_user}
      MYSQL_PASSWORD: \${DB_PASSWORD:-password}
    ports:
      - "\${DB_PORT:-3306}:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    command: --default-authentication-plugin=mysql_native_password

volumes:
  mysql_data:`;
      
      default:
        return this.generateDockerCompose(requirements, 'postgresql');
    }
  }
  
  /**
   * Performance audit functionality
   */
  async performanceAudit(connection, databaseType) {
    const audit = {
      timestamp: new Date().toISOString(),
      database: databaseType,
      performance_metrics: {},
      slow_queries: [],
      index_analysis: {},
      recommendations: []
    };
    
    // Generate performance analysis queries
    audit.analysis_queries = this.generatePerformanceQueries(databaseType);
    
    // Generate index analysis
    audit.index_analysis = this.generateIndexAnalysis(databaseType);
    
    // Generate recommendations
    audit.recommendations = this.generatePerformanceRecommendations(databaseType);
    
    return {
      success: true,
      audit,
      scripts: this.generateAuditScripts(databaseType)
    };
  }
  
  /**
   * Helper methods
   */
  getIdType(databaseType) {
    const types = {
      postgresql: 'SERIAL',
      mysql: 'INT',
      sqlite: 'INTEGER'
    };
    return types[databaseType] || 'INTEGER';
  }
  
  mapFieldType(type, databaseType) {
    const mappings = {
      postgresql: {
        string: 'VARCHAR',
        text: 'TEXT',
        integer: 'INTEGER',
        bigint: 'BIGINT',
        decimal: 'DECIMAL',
        float: 'REAL',
        boolean: 'BOOLEAN',
        date: 'DATE',
        datetime: 'TIMESTAMP',
        json: 'JSONB',
        uuid: 'UUID'
      },
      mysql: {
        string: 'VARCHAR',
        text: 'TEXT',
        integer: 'INT',
        bigint: 'BIGINT',
        decimal: 'DECIMAL',
        float: 'FLOAT',
        boolean: 'BOOLEAN',
        date: 'DATE',
        datetime: 'DATETIME',
        json: 'JSON',
        uuid: 'CHAR(36)'
      },
      sqlite: {
        string: 'TEXT',
        text: 'TEXT',
        integer: 'INTEGER',
        bigint: 'INTEGER',
        decimal: 'REAL',
        float: 'REAL',
        boolean: 'INTEGER',
        date: 'DATE',
        datetime: 'DATETIME',
        json: 'TEXT',
        uuid: 'TEXT'
      }
    };
    
    return mappings[databaseType]?.[type] || 'TEXT';
  }
  
  toPascalCase(str) {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  }
  
  mapToSequelizeType(sqlType) {
    const mappings = {
      'VARCHAR': 'STRING',
      'TEXT': 'TEXT',
      'INTEGER': 'INTEGER',
      'BIGINT': 'BIGINT',
      'DECIMAL': 'DECIMAL',
      'REAL': 'FLOAT',
      'BOOLEAN': 'BOOLEAN',
      'DATE': 'DATEONLY',
      'TIMESTAMP': 'DATE',
      'DATETIME': 'DATE',
      'JSONB': 'JSONB',
      'JSON': 'JSON',
      'UUID': 'UUID'
    };
    
    return mappings[sqlType] || 'STRING';
  }
  
  formatDefaultValue(value, type) {
    if (value === null) return 'NULL';
    if (type.includes('VARCHAR') || type.includes('TEXT')) {
      return `'${value}'`;
    }
    if (type === 'BOOLEAN') {
      return value ? 'TRUE' : 'FALSE';
    }
    return value;
  }
  
  async selectOptimalDatabase(analysis) {
    // Simple heuristics for database selection
    if (analysis.features.includes('full_text_search')) {
      return 'postgresql';
    }
    if (analysis.features.includes('json_heavy')) {
      return 'postgresql';
    }
    if (analysis.scalability === 'high') {
      return 'postgresql';
    }
    return 'postgresql'; // Default to PostgreSQL
  }
  
  async selectOptimalORM(requirements) {
    // Simple ORM selection logic
    if (requirements.typescript) {
      return 'typeorm';
    }
    if (requirements.modern) {
      return 'prisma';
    }
    return 'sequelize'; // Default
  }
  
  analyzeEntityFields(fields) {
    if (!fields) return [];
    
    return Object.entries(fields).map(([name, config]) => ({
      name,
      type: config.type || 'string',
      required: config.required || false,
      unique: config.unique || false,
      default: config.default,
      length: config.length,
      precision: config.precision,
      scale: config.scale
    }));
  }
  
  extractRelationships(entities) {
    const relationships = [];
    
    entities.forEach(entity => {
      if (entity.relationships) {
        entity.relationships.forEach(rel => {
          relationships.push({
            from: entity.name,
            to: rel.entity,
            type: rel.type,
            foreignKey: rel.foreignKey,
            onDelete: rel.onDelete || 'CASCADE',
            onUpdate: rel.onUpdate || 'CASCADE'
          });
        });
      }
    });
    
    return relationships;
  }
  
  analyzeQueryPatterns(queries) {
    return queries.map(query => ({
      sql: query.sql || query,
      frequency: query.frequency || 'medium',
      complexity: query.complexity || 'medium',
      performance_critical: query.performance_critical || false
    }));
  }
  
  extractDatabaseFeatures(requirements) {
    const features = [];
    
    if (requirements.search || requirements.fullTextSearch) {
      features.push('full_text_search');
    }
    if (requirements.json || requirements.jsonb) {
      features.push('json_heavy');
    }
    if (requirements.geospatial) {
      features.push('geospatial');
    }
    if (requirements.timeseries) {
      features.push('timeseries');
    }
    
    return features;
  }
}

export default DatabaseExpert;