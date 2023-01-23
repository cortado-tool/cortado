export class BackgroundTask {
  public Description: string;
  public CancellationFunc: Function;

  constructor(description: string, cancellationFunc: Function) {
    this.Description = description;
    this.CancellationFunc = cancellationFunc;
  }
}
