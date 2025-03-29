using backend.Agents;
using backend.Configurations;
using DotNetEnv;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddSwaggerGen();

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

/* === AZURE OPENAI CONFIGURATION === */
builder.Services.Configure<AOAIOptions>(builder.Configuration.GetSection("AOAI"));
/* === END AZURE OPENAI CONFIGURATION === */

/* === AZURE VISION CONFIGURATION === */
builder.Services.Configure<AzureVisionOptions>(builder.Configuration.GetSection("AZUREVISION"));
/* === END AZURE VISION CONFIGURATION === */

/* === CONTENT SAFETY CONFIGURATION === */
builder.Services.Configure<ContentSafetyOptions>(builder.Configuration.GetSection("CONTENTSAFETY"));
/* === END CONTENT SAFETY CONFIGURATION === */

/* === CENSOR AGENT CONFIGURATION === */
builder.Services.AddSingleton<CensorAgent>();
/* === END CENSOR AGENT CONFIGURATION === */

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", "Censor API V1"); });
}

// Enable CORS middleware
app.UseCors();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
