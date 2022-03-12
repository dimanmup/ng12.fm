using System.Net;
using System.Web;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using IOFile = System.IO.File;

namespace Server.Controllers;

[ApiController]
public class FileController: ControllerBase 
{
    // [Route("/api/rename")]
    // [HttpPost]
    // public ObjectResult Rename(string oldPath, string newPath)
    // {
    //     if (!IOFile.Exists(oldPath))
    //     {
    //         return new BadRequestObjectResult("File not found.");
    //     }

    //     try
    //     {
    //         IOFile.Move(oldPath, newPath);
    //     }
    //     catch (System.Exception e)
    //     {
    //         return new ObjectResult(e.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
    //     }

    //     return new OkObjectResult("The file has been renamed.");
    // }

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

        string name = System.IO.Path.GetFileName(path);

        try
        {
            new FileExtensionContentTypeProvider().TryGetContentType(name, out string? contentType);
            
            Response.ContentType = contentType ?? "application/octet-stream";
            Response.Headers.Add("Content-Disposition", string.Format("attachment; filename=\"{0}\"; filename*=UTF-8''{0}", HttpUtility.UrlPathEncode(name)));
            Response.Headers.Add("X-Content-Type-Options", "nosniff");

            await using StreamWriter sw = new StreamWriter(Response.Body);
            await IOFile.OpenRead(path).CopyToAsync(sw.BaseStream).ConfigureAwait(false);
            await sw.FlushAsync().ConfigureAwait(false);
        }
        catch (Exception e)
        {
            Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            Response.ContentType = "text/plain";
            await Response.WriteAsync(e.Message);
        }
    }
}