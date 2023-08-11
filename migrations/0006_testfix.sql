create or replace function test_update() returns trigger as $$
declare
    notification_payload text;
begin
    insert into test (name) values(NEW.name)
    returning id, name into notification_payload;

    perform pg_notify (
        'test_row_added',
        notification_payload
    ); return new;
end; $$ language plpgsql;

create trigger test_trigger after
insert
    on test for each row execute function test_update();
