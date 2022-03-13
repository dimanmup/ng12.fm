namespace Server;

public class Query
{
    public IEnumerable<DirectoryNode> GetDirectories([Service]Dictionary<string, string> settings, string? parentPath)
    {
        DirectoryInfo parent = new DirectoryInfo(parentPath ?? settings["fs-root"]);

        if (!parent.Exists)
        {
            return new DirectoryNode[0];
        }

        IEnumerable<DirectoryNode> directories = parent
            .GetDirectories("*", SearchOption.TopDirectoryOnly)
            .Select(child => new DirectoryNode(child));

        return parentPath is not null ? directories : directories.Prepend(new DirectoryNode(parent, true));
    }

    public IEnumerable<FileNode> GetFiles([Service]Dictionary<string, string> settings, string? parentPath)
    {
        DirectoryInfo parent = new DirectoryInfo(parentPath ?? settings["fs-root"]);

        if (!parent.Exists)
        {
            return new FileNode[0];
        }

        return parent
            .GetFiles("*", SearchOption.TopDirectoryOnly)
            .Select(child => new FileNode(child));
    }
}
