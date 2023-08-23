create or replace function match_update() returns trigger as $$
declare
    notification json;
begin
    notification := row_to_json(NEW);
    if NEW.open then
        perform pg_notify (
            'added_match',
            notification::text
        );
    end if; return new;
end; $$ language plpgsql;

create trigger test_trigger after
insert
    on matches for each row execute function match_update();
