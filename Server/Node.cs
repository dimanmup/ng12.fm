namespace Server;

public class Node
{
    public string Name { get; }
    public string Path { get; }
    public bool IsParent { get; }
    public DateTime DateOfReceiving { get; }

    public Node(DirectoryInfo parent)
    {
        Path = parent.FullName;
        Name = System.IO.Path.GetFileName(parent.FullName) ?? "null";
        DateOfReceiving = DateTime.Now;
        IsParent = parent.GetDirectories("*", SearchOption.TopDirectoryOnly).Any();
    }
}