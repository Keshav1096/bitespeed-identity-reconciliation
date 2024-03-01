-- Type creation
CREATE TYPE link_precedence_type AS enum ('secondary', 'primary');


-- Table creation
CREATE TABLE contact (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(255),
    email VARCHAR(255),
    linked_id INT,
    link_precedence link_precedence_type,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
