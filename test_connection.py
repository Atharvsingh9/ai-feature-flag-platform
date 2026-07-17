from infrastructure.database.session import engine
from sqlalchemy import text


def main():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))

        print(result.scalar())


if __name__ == "__main__":
    main()