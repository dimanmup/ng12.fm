namespace Server;

public interface INode
{
    string Name { get; }
    string Path { get; }
    DateTime DateOfReceiving { get; }
}