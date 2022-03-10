namespace Server;

public class FileNode : INode
{
    private readonly FileInfo fi;

    public FileNode(FileInfo fi)
    {
        this.fi = fi;
    }

    public string Path => fi.FullName;
    public string Name => fi.Name;
    public DateTime DateOfReceiving => DateTime.Now;
    public DateTime DateOfCreation => fi.CreationTime;
    public DateTime DateOfLastAccess => fi.LastAccessTime;
    public DateTime DateOfLastWrite => fi.LastWriteTime;
    public long Size => fi.Length;
}