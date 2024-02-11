DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS transaction_project;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS transactions;

CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    "description" TEXT,
    "date" DATE NOT NULL
);

CREATE TABLE users (
    username TEXT PRIMARY KEY CHECK (username LIKE 'ist%'),
    active BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    photo TEXT,
    email TEXT
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    active BOOLEAN NOT NULL,
    symbolic BOOLEAN NOT NULL
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    "date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "value" NUMERIC NOT NULL,
    has_file BOOLEAN NOT NULL,
    has_nif BOOLEAN NOT NULL
);

CREATE TABLE transaction_project (
    transaction_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    PRIMARY KEY (transaction_id, project_id),
    FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE OR REPLACE PROCEDURE create_user(
   p_username TEXT,
   p_name TEXT
)
AS $$
BEGIN
   INSERT INTO users (username, active, "name")
   VALUES (p_username, false, p_name);
END;
$$ LANGUAGE plpgsql;

INSERT INTO projects("name", active, symbolic)
VALUES
('HS', TRUE, TRUE),
('Bank', TRUE, TRUE),
('Others', TRUE, TRUE),
('FLOS 3D Printer', TRUE, FALSE),
('Arquimedia', TRUE, FALSE),
('HSApp', TRUE, FALSE),
('HSGame', FALSE, FALSE),
('HS-TMS', TRUE, FALSE),
('INAR', TRUE, FALSE),
('MIDIKeyboard', FALSE, FALSE);

INSERT INTO transactions("date", "description", "value", has_file, has_nif) 
VALUES
(CURRENT_DATE - INTERVAL '3 months', 'Capital Injection', 200, FALSE, FALSE),
(CURRENT_DATE - INTERVAL '2 months', 'Taxes', -20, FALSE, FALSE),
(CURRENT_DATE - INTERVAL '1 months', 'Taxes', -15, FALSE, FALSE),
(CURRENT_DATE- INTERVAL '2 days', 'Taxes', -10, FALSE, FALSE),
(CURRENT_DATE - INTERVAL '2 months 15 days', 'Workshop', 60, FALSE, FALSE),
(CURRENT_DATE - INTERVAL '2 months', 'Workshop', 60, FALSE, FALSE),
(CURRENT_DATE - INTERVAL '1 months', 'Workshop', 40, FALSE, FALSE),
(CURRENT_DATE - INTERVAL '3 months', 'Server', -40, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '2 months', 'Server', -40, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '1 months', 'Server', -40, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '3 months', 'New Subscriptions', 60, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '2 months', 'New Subscriptions', 50, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '1 months', 'New Subscriptions', 60, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '15 days', 'New Subscriptions', 40, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '2 months 28 days', 'Merch Fabrication', -70, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '2 months', 'Merch', 30, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '1 months', 'Merch', 40, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '5 days', 'Merch', 30, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '2 months 17 days', '3D Print Materials', -20, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '1 month 17 days', '3D Print Materials', -20, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '28 days', '3D Print Materials', -20, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '2 days', '3D Print Materials', -20, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '2 months', 'Print Request', 40, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '1 months', 'Print Request', 60, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '23 days', 'Print Request', 30, FALSE, TRUE),
(CURRENT_DATE - INTERVAL '12 days', 'Print Request', 20, FALSE, TRUE);


INSERT INTO transaction_project(transaction_id, project_id)
VALUES
(1,1),
(2,2),
(3,2),
(4,2),
(5,3),
(6,3),
(7,3),
(8,5),
(9,5),
(10,5),
(11,5),
(12,5),
(13,5),
(14,5),
(15,1),
(16,1),
(17,1),
(18,1),
(19,4),
(20,4),
(21,4),
(22,4),
(23,4),
(24,4),
(25,4),
(26,4);