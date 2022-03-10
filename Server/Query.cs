namespace Server;

public class Query
{
    public IEnumerable<Node> Children([Service]Dictionary<string, string> settings, string? parentPath)
    {
        /*
        query Children($parentPath: String!)
        {
            children(rootPath: $parentPath) {
                ...
            }
        }
        */
        
        DirectoryInfo di = new DirectoryInfo(parentPath ?? settings["fs-root"]);

        if (!di.Exists)
        {
            return new Node[0];
        }

        return di
            .GetDirectories("*", SearchOption.TopDirectoryOnly)
            .Select(d => new Node(d.FullName));
    }
}
