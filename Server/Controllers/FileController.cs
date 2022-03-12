using System.Net;
using Microsoft.AspNetCore.Mvc;
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
}