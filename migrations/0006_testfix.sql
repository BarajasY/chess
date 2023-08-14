drop type testType;
create type testType as (id integer, name text);

create or replace function test_update() returns trigger as $$
declare
    notification json;
begin
    notification := row_to_json(NEW);
    perform pg_notify (
        'test_row_added',
        notification::text
    ); return new;
end; $$ language plpgsql;

create trigger test_trigger after
insert
    on test for each row execute function test_update();
