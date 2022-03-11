namespace Server;

public class DirectoryNode : INode
{
    private readonly DirectoryInfo parent;
    
    public DirectoryNode(DirectoryInfo parent)
    {
        this.parent = parent;
    }

    public string Path => parent.FullName;
    public string Name => parent.Name;
    public DateTime DateOfReceiving => DateTime.Now;
    public bool IsParent => parent.GetDirectories("*", SearchOption.TopDirectoryOnly).Any();
}