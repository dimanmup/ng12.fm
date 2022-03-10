namespace Server;

public class Node
{
    public string Name { get; }
    public string Path { get; }
    public bool IsParent { get; }
    public string? Error { get; }
    public DateTime DateOfReceiving { get; }

    public Node(string path)
    {
        DirectoryInfo di = new DirectoryInfo(path);
        Path = path;
        Name = System.IO.Path.GetFileName(path) ?? "\"ROOT\"";
        DateOfReceiving = DateTime.Now;

        if (!di.Exists)
        {
            Error = "Directory not found.";
            return;
        }

        IsParent = di.GetDirectories("*", SearchOption.TopDirectoryOnly).Any();
    }
}