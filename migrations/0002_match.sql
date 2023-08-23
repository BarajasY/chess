CREATE TABLE matches (
    code VARCHAR(30) NOT NULL UNIQUE,
    user_one_code VARCHAR(30) NOT NULL,
    user_two_code VARCHAR(30),
    open BOOLEAN
);
