drop policy "Profiles are viewable by self." on "public"."profiles";

drop policy "Users can insert their own profile." on "public"."profiles";

drop policy "Users can update own profile." on "public"."profiles";

revoke delete on table "public"."contact_messages" from "anon";

revoke insert on table "public"."contact_messages" from "anon";

revoke references on table "public"."contact_messages" from "anon";

revoke select on table "public"."contact_messages" from "anon";

revoke trigger on table "public"."contact_messages" from "anon";

revoke truncate on table "public"."contact_messages" from "anon";

revoke update on table "public"."contact_messages" from "anon";

revoke delete on table "public"."contact_messages" from "authenticated";

revoke insert on table "public"."contact_messages" from "authenticated";

revoke references on table "public"."contact_messages" from "authenticated";

revoke select on table "public"."contact_messages" from "authenticated";

revoke trigger on table "public"."contact_messages" from "authenticated";

revoke truncate on table "public"."contact_messages" from "authenticated";

revoke update on table "public"."contact_messages" from "authenticated";

revoke delete on table "public"."contact_messages" from "service_role";

revoke insert on table "public"."contact_messages" from "service_role";

revoke references on table "public"."contact_messages" from "service_role";

revoke select on table "public"."contact_messages" from "service_role";

revoke trigger on table "public"."contact_messages" from "service_role";

revoke truncate on table "public"."contact_messages" from "service_role";

revoke update on table "public"."contact_messages" from "service_role";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

revoke delete on table "public"."stripe_customers" from "anon";

revoke insert on table "public"."stripe_customers" from "anon";

revoke references on table "public"."stripe_customers" from "anon";

revoke select on table "public"."stripe_customers" from "anon";

revoke trigger on table "public"."stripe_customers" from "anon";

revoke truncate on table "public"."stripe_customers" from "anon";

revoke update on table "public"."stripe_customers" from "anon";

revoke delete on table "public"."stripe_customers" from "authenticated";

revoke insert on table "public"."stripe_customers" from "authenticated";

revoke references on table "public"."stripe_customers" from "authenticated";

revoke select on table "public"."stripe_customers" from "authenticated";

revoke trigger on table "public"."stripe_customers" from "authenticated";

revoke truncate on table "public"."stripe_customers" from "authenticated";

revoke update on table "public"."stripe_customers" from "authenticated";

revoke delete on table "public"."stripe_customers" from "service_role";

revoke insert on table "public"."stripe_customers" from "service_role";

revoke references on table "public"."stripe_customers" from "service_role";

revoke select on table "public"."stripe_customers" from "service_role";

revoke trigger on table "public"."stripe_customers" from "service_role";

revoke truncate on table "public"."stripe_customers" from "service_role";

revoke update on table "public"."stripe_customers" from "service_role";

revoke delete on table "public"."user_products" from "anon";

revoke insert on table "public"."user_products" from "anon";

revoke references on table "public"."user_products" from "anon";

revoke select on table "public"."user_products" from "anon";

revoke trigger on table "public"."user_products" from "anon";

revoke truncate on table "public"."user_products" from "anon";

revoke update on table "public"."user_products" from "anon";

revoke delete on table "public"."user_products" from "authenticated";

revoke insert on table "public"."user_products" from "authenticated";

revoke references on table "public"."user_products" from "authenticated";

revoke select on table "public"."user_products" from "authenticated";

revoke trigger on table "public"."user_products" from "authenticated";

revoke truncate on table "public"."user_products" from "authenticated";

revoke update on table "public"."user_products" from "authenticated";

revoke delete on table "public"."user_products" from "service_role";

revoke insert on table "public"."user_products" from "service_role";

revoke references on table "public"."user_products" from "service_role";

revoke select on table "public"."user_products" from "service_role";

revoke trigger on table "public"."user_products" from "service_role";

revoke truncate on table "public"."user_products" from "service_role";

revoke update on table "public"."user_products" from "service_role";

alter table "public"."profiles" drop constraint "profiles_id_fkey";

alter table "public"."stripe_customers" drop constraint "stripe_customers_stripe_customer_id_key";

alter table "public"."stripe_customers" drop constraint "stripe_customers_user_id_fkey";

alter table "public"."user_products" drop constraint "user_products_user_id_fkey";

drop function if exists "public"."handle_new_user"();

drop function if exists "public"."user_password_set"();

alter table "public"."contact_messages" drop constraint "contact_messages_pkey";

alter table "public"."profiles" drop constraint "profiles_pkey";

alter table "public"."stripe_customers" drop constraint "stripe_customers_pkey";

alter table "public"."user_products" drop constraint "user_products_pkey";

drop index if exists "public"."contact_messages_pkey";

drop index if exists "public"."profiles_pkey";

drop index if exists "public"."stripe_customers_pkey";

drop index if exists "public"."stripe_customers_stripe_customer_id_key";

drop index if exists "public"."user_products_pkey";

drop table "public"."contact_messages";

drop table "public"."profiles";

drop table "public"."stripe_customers";

drop table "public"."user_products";

create table "public"."courses" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text default ''::text,
    "address" text default ''::text,
    "lng" text default ''::text,
    "lat" text default ''::text,
    "holes" smallint
);


drop type "public"."stripe_payment_mode";

CREATE UNIQUE INDEX courses_pkey ON public.courses USING btree (id);

alter table "public"."courses" add constraint "courses_pkey" PRIMARY KEY using index "courses_pkey";

grant delete on table "public"."courses" to "anon";

grant insert on table "public"."courses" to "anon";

grant references on table "public"."courses" to "anon";

grant select on table "public"."courses" to "anon";

grant trigger on table "public"."courses" to "anon";

grant truncate on table "public"."courses" to "anon";

grant update on table "public"."courses" to "anon";

grant delete on table "public"."courses" to "authenticated";

grant insert on table "public"."courses" to "authenticated";

grant references on table "public"."courses" to "authenticated";

grant select on table "public"."courses" to "authenticated";

grant trigger on table "public"."courses" to "authenticated";

grant truncate on table "public"."courses" to "authenticated";

grant update on table "public"."courses" to "authenticated";

grant delete on table "public"."courses" to "service_role";

grant insert on table "public"."courses" to "service_role";

grant references on table "public"."courses" to "service_role";

grant select on table "public"."courses" to "service_role";

grant trigger on table "public"."courses" to "service_role";

grant truncate on table "public"."courses" to "service_role";

grant update on table "public"."courses" to "service_role";


