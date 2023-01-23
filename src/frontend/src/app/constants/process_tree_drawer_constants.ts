/*
  Defines tree constants that should be directly applied to each SVG element
  and that form the basic visualization of the tree.
  This allows for us to export the styled tree
*/

export class PT_Constant {
  public static BASE_HEIGHT_WIDTH = 30;
  public static EXPORT_OFFSET = 20;
  public static NODE_SPACING = 20;

  public static STROKE_WIDTH = '2';
  public static STROKE_COLOR = 'gray';
  public static CORNER_RADIUS = '3';
  public static INVISIBLE_FONT_SIZE = '2em';
  public static OPERATOR_FONT_SIZE = '1.5em';
  public static VISIBLE_FONT_SIZE = '12px';

  public static DEFAULT_STROKE_COLOR = 'gray';
  public static OPERATOR_COLOR = '#404040';
  public static VISIBILE_ACTIVITY_DEFAULT_COLOR = '#8f8f8f';
  public static INVISIBLE_ACTIVTIY_COLOR = '#181818';
}
