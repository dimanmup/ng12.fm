namespace Server;

public class Query
{
    public IEnumerable<Node> Children([Service]Dictionary<string, string> settings, string? parentPath)
    {
        /*
        query Children($parentPath: String!)
        {
            children(parentPath: $parentPath) {
                ...
            }
        }
        */
        
        DirectoryInfo parent = new DirectoryInfo(parentPath ?? settings["fs-root"]);

        if (!parent.Exists)
        {
            return new Node[0];
        }

        return parent
            .GetDirectories("*", SearchOption.TopDirectoryOnly)
            .Select(child => new Node(child));
    }
}
