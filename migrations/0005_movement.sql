CREATE TABLE movements (
    code VARCHAR(50) NOT NULL,
    movement VARCHAR(50) NOT NULL,
    sent VARCHAR(100) NOT NULL,
    registered_at DATE NOT NULL DEFAULT NOW()
);
