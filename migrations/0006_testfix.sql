create or replace function test_update() returns trigger as $$
begin
    perform pg_notify (
        'test_row_added',
        NEW::text
    ); return new;
end; $$ language plpgsql;

create trigger test_trigger after
insert
    on test for each row execute function test_update();
