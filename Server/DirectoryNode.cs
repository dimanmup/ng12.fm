namespace Server;

public class DirectoryNode : INode
{
    private readonly DirectoryInfo di;
    private readonly bool isGhost;
    
    public DirectoryNode(DirectoryInfo di, bool isGhost = false)
    {
        this.di = di;
        this.isGhost = isGhost;
    }

    public string Path => di.FullName;
    public string Name => isGhost ? (OperatingSystem.IsWindows() ? @".\" : "./") : di.Name;
    public DateTime DateOfReceiving => DateTime.Now;
    public bool IsParent => !isGhost && di.GetDirectories("*", SearchOption.TopDirectoryOnly).Any();
}