CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    user_one VARCHAR(100),
    user_one_id INT NOT NULL,
    user_two VARCHAR(100),
    user_two_id INT NOT NULL,
    FOREIGN KEY (user_one_id) REFERENCES users(id),
    FOREIGN KEY (user_two_id) REFERENCES users(id)
);
