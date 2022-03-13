namespace Server;

public class DirectoryNode : INode
{
    private readonly DirectoryInfo parent;
    private readonly bool isGhost;
    
    public DirectoryNode(DirectoryInfo di, bool isGhost = false)
    {
        this.parent = di;
        this.isGhost = isGhost;
    }

    public string Path => parent.FullName;
    public string Name => isGhost ? @".\" : parent.Name;
    public DateTime DateOfReceiving => DateTime.Now;
    public bool IsParent => !isGhost && parent.GetDirectories("*", SearchOption.TopDirectoryOnly).Any();
}