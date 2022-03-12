using System.IO;
using System.Net;
using System.Web;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using IOFile = System.IO.File;
using IOPath = System.IO.Path;

namespace Server.Controllers;

[ApiController]
public class FileController: ControllerBase 
{
    [Route("/api/download")]
    public async Task Download(string path)
    {
        if (!IOFile.Exists(path))
        {
            Response.StatusCode = (int)HttpStatusCode.BadRequest;
            Response.ContentType = "text/plain";
            await Response.WriteAsync("File not found.");

            return;
        }

        string name = IOPath.GetFileName(path);

        try
        {
            new FileExtensionContentTypeProvider().TryGetContentType(name, out string? contentType);
            
            Response.ContentType = contentType ?? "application/octet-stream";
            Response.Headers.Add("Content-Disposition", string.Format("attachment; filename=\"{0}\"; filename*=UTF-8''{0}", HttpUtility.UrlPathEncode(name)));
            Response.Headers.Add("X-Content-Type-Options", "nosniff");

            await using FileStream fs = IOFile.OpenRead(path);
            await fs.CopyToAsync(Response.Body);
            await fs.FlushAsync();
        }
        catch (Exception e)
        {
            Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            Response.ContentType = "text/plain";
            await Response.WriteAsync(e.Message);
        }
    }
    
    [Route("/api/delete")]
    public ObjectResult Delete(string path)
    {
        if (IOFile.Exists(path))
        {
            try
            {
                IOFile.Delete(path);
            }
            catch (Exception e)
            {
                return new ObjectResult(e.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
            }

            return new OkObjectResult("The file has been deleted.");
        }

        return new ObjectResult("File not found.") { StatusCode = (int)HttpStatusCode.BadRequest };
    }

    [Route("/api/rename")]
    public ObjectResult Rename(string oldPath, string newName)
    {
        if (!IOFile.Exists(oldPath))
        {
            return new BadRequestObjectResult("File not found.");
        }

        string newPath = IOPath.Combine(IOPath.GetDirectoryName(oldPath) ?? "", newName);

        if (IOFile.Exists(newPath))
        {
            return new BadRequestObjectResult("New name already taken.");
        }

        try
        {
            IOFile.Move(oldPath, newPath);
        }
        catch (System.Exception e)
        {
            return new ObjectResult(e.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
        }

        return new OkObjectResult("The file has been renamed.");
    }
}