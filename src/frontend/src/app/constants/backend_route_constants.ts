export class ROUTES {
  public static BASE_URL = '127.0.0.1:41211/';
  public static HTTP_BASE_URL = 'http://' + this.BASE_URL;
  public static WS_HTTP_BASE_URL = 'ws://' + this.BASE_URL;

  public static LOG = 'log/';
  public static DISCOVER = 'discoverTree/';
  public static MODIFY_LOG = 'modifylog/';
  public static MODIFY_TREE = 'modifyTree/';
  public static PT_STRING = 'treeSting/';
  public static TREE_PERFORMANCE = 'treePerformance/';
  public static VARIANT = 'variant/';
  public static VARIANT_PERFORMANCE = 'variantPerformance/';
  public static SUBVARIANT_PERFORMANCE = 'subvariantPerformance/';
  public static TREE_CONFORMANCE = 'treeConformance/';
  public static VARIANT_CONFORMANCE = 'variantConformance/';
  public static QUERY = 'variantQuery/';
  public static CONFIG = 'config/';
  public static EXPORT = 'exporting/';
  public static IMPORT = 'importing/';
  public static VARIANTMINING = 'subvariantMining/';
  public static TIEBREAKER = 'tiebreaker/';
}
