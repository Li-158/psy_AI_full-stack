#!/usr/bin/env python3
"""
資料庫初始化腳本
Database initialization script for Psychology Lab System
"""

import asyncio
import asyncpg
import logging
from pathlib import Path
import sys
import os

# 添加 app 路徑到 Python 路徑
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.config import settings
from app.auth import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_admin_user(conn):
    """創建默認管理員用戶"""
    try:
        # 檢查是否已有管理員用戶
        admin_exists = await conn.fetchval(
            "SELECT COUNT(*) FROM users WHERE role = 'admin'"
        )
        
        if admin_exists == 0:
            # 創建默認管理員
            admin_email = "admin@psychologylab.com"
            admin_password = "admin123"  # 生產環境應該使用更安全的密碼
            password_hash = get_password_hash(admin_password)
            
            await conn.execute("""
                INSERT INTO users (email, password_hash, role)
                VALUES ($1, $2, 'admin')
            """, admin_email, password_hash)
            
            logger.info(f"✅ Created admin user: {admin_email}")
            logger.info(f"🔐 Default password: {admin_password}")
            logger.warning("⚠️  Please change the default password after first login!")
        else:
            logger.info("ℹ️  Admin user already exists")
            
    except Exception as e:
        logger.error(f"❌ Error creating admin user: {e}")
        raise


async def run_sql_file(conn, file_path: Path):
    """執行 SQL 文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # 分割 SQL 語句（簡單的分割，可能需要更復雜的解析）
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
        
        for statement in statements:
            if statement:
                try:
                    await conn.execute(statement)
                except Exception as e:
                    # 某些語句可能會失敗（如已存在的表），這是正常的
                    if "already exists" not in str(e).lower():
                        logger.warning(f"⚠️  SQL statement failed: {statement[:100]}...")
                        logger.warning(f"⚠️  Error: {e}")
        
        logger.info(f"✅ Executed SQL file: {file_path.name}")
        
    except Exception as e:
        logger.error(f"❌ Error executing SQL file {file_path}: {e}")
        raise


async def init_database():
    """初始化資料庫"""
    logger.info("🚀 Starting database initialization...")
    
    try:
        # 連接資料庫
        conn = await asyncpg.connect(settings.database_url)
        logger.info("✅ Connected to database")
        
        # 獲取腳本目錄
        script_dir = Path(__file__).parent
        
        # 執行資料庫架構初始化
        schema_file = script_dir / "init_db.sql"
        if schema_file.exists():
            logger.info("📋 Initializing database schema...")
            await run_sql_file(conn, schema_file)
        else:
            logger.warning(f"⚠️  Schema file not found: {schema_file}")
        
        # 創建管理員用戶
        logger.info("👤 Creating admin user...")
        await create_admin_user(conn)
        
        # 可選：載入種子資料
        seed_file = script_dir / "seed_data.sql"
        if seed_file.exists():
            load_seed = input("🌱 Load seed data? (y/N): ").lower().strip()
            if load_seed in ['y', 'yes']:
                logger.info("🌱 Loading seed data...")
                await run_sql_file(conn, seed_file)
        
        # 驗證安裝
        logger.info("🔍 Verifying installation...")
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        """)
        
        logger.info("📊 Database tables:")
        for table in tables:
            count = await conn.fetchval(f"SELECT COUNT(*) FROM {table['table_name']}")
            logger.info(f"  • {table['table_name']}: {count} records")
        
        await conn.close()
        logger.info("✅ Database initialization completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        sys.exit(1)


async def reset_database():
    """重置資料庫（危險操作）"""
    logger.warning("⚠️  WARNING: This will delete ALL data in the database!")
    confirm = input("Are you sure you want to reset the database? Type 'RESET' to confirm: ")
    
    if confirm != "RESET":
        logger.info("ℹ️  Database reset cancelled")
        return
    
    try:
        conn = await asyncpg.connect(settings.database_url)
        logger.info("🔄 Resetting database...")
        
        # 刪除所有表
        await conn.execute("""
            DROP TABLE IF EXISTS experiments CASCADE;
            DROP TABLE IF EXISTS project_researchers CASCADE;
            DROP TABLE IF EXISTS subprojects CASCADE;
            DROP TABLE IF EXISTS projects CASCADE;
            DROP TABLE IF EXISTS participants CASCADE;
            DROP TABLE IF EXISTS researchers CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
        """)
        
        logger.info("🗑️  All tables dropped")
        await conn.close()
        
        # 重新初始化
        await init_database()
        
    except Exception as e:
        logger.error(f"❌ Database reset failed: {e}")
        sys.exit(1)


async def check_database():
    """檢查資料庫狀態"""
    try:
        conn = await asyncpg.connect(settings.database_url)
        logger.info("✅ Database connection successful")
        
        # 檢查表是否存在
        tables = await conn.fetch("""
            SELECT table_name, 
                   (SELECT COUNT(*) FROM information_schema.columns 
                    WHERE table_name = t.table_name AND table_schema = 'public') as column_count
            FROM information_schema.tables t
            WHERE table_schema = 'public' 
            ORDER BY table_name
        """)
        
        if tables:
            logger.info("📊 Database status:")
            for table in tables:
                count = await conn.fetchval(f"SELECT COUNT(*) FROM {table['table_name']}")
                logger.info(f"  • {table['table_name']}: {count} records, {table['column_count']} columns")
        else:
            logger.warning("⚠️  No tables found in database")
        
        await conn.close()
        
    except Exception as e:
        logger.error(f"❌ Database check failed: {e}")
        sys.exit(1)


def main():
    """主函數"""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python init_database.py init    - Initialize database")
        print("  python init_database.py reset   - Reset database (DANGEROUS)")
        print("  python init_database.py check   - Check database status")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "init":
        asyncio.run(init_database())
    elif command == "reset":
        asyncio.run(reset_database())
    elif command == "check":
        asyncio.run(check_database())
    else:
        logger.error(f"❌ Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()
