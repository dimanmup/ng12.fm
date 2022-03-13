using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using System.Net;
using System.Web;
using IO = System.IO;

namespace Server.Controllers;

[ApiController]
public class FileController: ControllerBase 
{
    [Route("/api/download")]
    public async Task Download(string path)
    {
        if (!IO.File.Exists(path))
        {
            Response.StatusCode = (int)HttpStatusCode.BadRequest;
            Response.ContentType = "text/plain";
            await Response.WriteAsync("File not found.");

            return;
        }

        string name = IO.Path.GetFileName(path);

        try
        {
            new FileExtensionContentTypeProvider().TryGetContentType(name, out string? contentType);
            
            Response.ContentType = contentType ?? "application/octet-stream";
            Response.Headers.Add("Content-Disposition", string.Format("attachment; filename=\"{0}\"; filename*=UTF-8''{0}", HttpUtility.UrlPathEncode(name)));
            Response.Headers.Add("X-Content-Type-Options", "nosniff");

            await using FileStream fs = IO.File.OpenRead(path);
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
    
    [Route("/api/delete/file")]
    public ObjectResult DeleteFile(string path)
    {
        if (!IO.File.Exists(path))
        {
            return new ObjectResult("File not found.") { StatusCode = (int)HttpStatusCode.BadRequest };
        }

        try
        {
            IO.File.Delete(path);
        }
        catch (Exception e)
        {
            return new ObjectResult(e.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
        }

        return new OkObjectResult("The file has been deleted.");
    }

    // [Route("/api/delete/folder")]
    // public ObjectResult DeleteFolder(string path)
    // {
    //     if (!Directory.Exists(path))
    //     {
    //         return new ObjectResult("Directory not found.") { StatusCode = (int)HttpStatusCode.BadRequest };
    //     }

    //     try
    //     {
    //         Directory.Delete(path, true);
    //     }
    //     catch (Exception e)
    //     {
    //         return new ObjectResult(e.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
    //     }

    //     return new OkObjectResult("The file has been deleted.");
    // }

    [Route("/api/rename/file")]
    public ObjectResult RenameFile(string oldPath, string newName)
    {
        if (!IO.File.Exists(oldPath))
        {
            return new BadRequestObjectResult("File not found.");
        }

        string newPath = IO.Path.Combine(IO.Path.GetDirectoryName(oldPath) ?? "", newName);

        if (IO.File.Exists(newPath))
        {
            return new BadRequestObjectResult("New name already taken.");
        }

        try
        {
            IO.File.Move(oldPath, newPath);
        }
        catch (Exception e)
        {
            return new ObjectResult(e.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
        }

        return new OkObjectResult("The file has been renamed.");
    }

    [Route("/api/rename/folder")]
    public ObjectResult RenameFolder(string oldPath, string newName)
    {
        if (!Directory.Exists(oldPath))
        {
            return new BadRequestObjectResult("Folder not found.");
        }

        string newPath = IO.Path.Combine(IO.Path.GetDirectoryName(oldPath) ?? "", newName);

        if (Directory.Exists(newPath))
        {
            return new BadRequestObjectResult("New name already taken.");
        }

        try
        {
            Directory.Move(oldPath, newPath);
        }
        catch (Exception e)
        {
            return new ObjectResult(e.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
        }
        
        return new OkObjectResult("The folder has been renamed.");
    }
}