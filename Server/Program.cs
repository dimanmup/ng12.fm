var builder = WebApplication.CreateBuilder(args);

#region Cors
const string corsPolicyName = "cors policy";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: corsPolicyName,
        builder =>
        {
            builder
                .WithOrigins("http://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .AllowAnyHeader();
        });
});
#endregion

// GraphQL
builder.Services.AddGraphQLServer()
    .AddQueryType<Server.Query>();

builder.Services.AddSingleton(new Dictionary<string, string> {
    { "fs-root", builder.Configuration["FileSystemTreeview:Root"] }
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(corsPolicyName);
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapGraphQL();

app.Run();
