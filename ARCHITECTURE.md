# Architecture

The developer operations uses Deno Fresh on Deno Deploy to go live in 30+ regions globally on push; live in seconds.

The backend for the system is contained in supabase. This handles authz and authn requirements for accessing the database.

The network layer has multiplayer, instantaneous updates, and offline access, because it is backed by replicache.

The front of the frontend utilizes Tag for widgets and Cutestrap for the design system.


