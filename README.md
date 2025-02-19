# API NODE JS FLUTTER SUPRABASE SERVICES

## How to create project API

<code>

<ul>
<li>mkdir supabase-auth</li>
<li>cd supabase-auth</li>
<li>npm init -y</li>
<li>npm install express supabase-js dotenv jsonwebtoken bcryptjs cors</li>
</ul>
</code>

## How config env
Lupefet@232
<code>
<ul>
<li>SUPABASE_URL=tu_url_de_supabase</li>
<li>SUPABASE_ANON_KEY=tu_clave_anonima</li>
<li>SUPABASE_SERVICE_ROLE=tu_clave_de_rol_de_servicio</li>
<li>JWT_SECRET=clave_secreta</li>
</ul>
</code>

## How To configure proyect
<p>Configure typescript globaly on coputer</p>
<code>npm install -g typescript</code>
<h6><strong>to test</strong> "<ul>tsc --version</ul>"</h6>
## How config debugger
<code>
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug App",
      "program": "${workspaceFolder}/src/app.ts",
      "runtimeArgs": ["--nolazy", "-r", "ts-node/register"],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true,
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "restart": true
    }
  ]
}
</code>

## How config tsConfig.json

<p>Add these last lines to debug over typescript</p>
<code>
    "sourceMap": true,
    "outDir": "./dist", 
</code>

## Final, Run in another terminal

<h6>You must tu run into another terminal the next command to autocompile changes</h6>
<code>npx tsc --watch</code>


## SUPABASE FUNCTIONS TOOLS

<ul>
  <li><strong>To authenticate with supa</strong>await supabaseAdmin.auth.signInWithPassword({email: data.email,password: data.password,});</li>
  <li><strong>To close all sessions of present users</strong> await supabaseAdmin.auth.signOut({ scope: "global" })</li>
  <li><strong>To close others sessions of present users, except last</strong> await supabaseAdmin.auth.signOut({ scope: "others" })</li>
  <li><strong>To close sessions others users</strong>await supabaseAdmin.auth.admin.signOut(userId);</li>
</ul>