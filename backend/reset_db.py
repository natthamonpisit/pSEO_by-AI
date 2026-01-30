from app.database import get_db

def reset_database():
    print("🗑️  Reseting Database...")
    db = get_db()

    # Delete Comparisons first (FK dependency)
    try:
        res = db.table("comparisons").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print(f"✅ Comparisons Reset")
    except Exception as e:
        print(f"⚠️ Error resetting comparisons: {e}")

    # Delete Products
    try:
        res = db.table("products").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print(f"✅ Products Reset")
    except Exception as e:
        print(f"⚠️ Error resetting products: {e}")

    # Delete Categories
    try:
        res = db.table("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print(f"✅ Categories Reset")
    except Exception as e:
        print(f"⚠️ Error resetting categories: {e}")

    print("\n✨ Database is now fresh!")

if __name__ == "__main__":
    reset_database()
