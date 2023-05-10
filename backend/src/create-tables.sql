CREATE TABLE "reminders" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATE
);

CREATE TABLE "users" ("username" TEXT PRIMARY KEY);

CREATE TABLE "variables" (
    "name" TEXT PRIMARY KEY,
    "value" TEXT NOT NULL
);

CREATE TABLE "projects" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "active" BOOLEAN NOT NULL
);

CREATE TABLE "transactions" (
    "id" SERIAL PRIMARY KEY,
    "date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "value" NUMERIC NOT NULL,
    "file_path" TEXT UNIQUE,
    "has_nif" BOOLEAN NOT NULL
);

CREATE TABLE "transaction_project" (
    "transaction_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    PRIMARY KEY (transaction_id, project_id),
    FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);