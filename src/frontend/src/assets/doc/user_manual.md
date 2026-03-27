# Introduction

Process discovery is a critical discipline in process mining that deals with the data-driven generation of insights into operational processes. Given event data, process discovery algorithms learn process models that describe the execution of various activities in the process. These discovered process models are essential artifacts and are used in multiple process mining techniques. Most conventional process discovery techniques act as a black box and do not support user involvement apart from initial parameter tuning. These techniques often result in process models having poor quality. Cortado is a tool that allows for interactive process discovery, enabling users to gradually learn process models while having complete control during the increments. 




#### Functionalities

##### Event data handling

  Event data handling in Cortado includes exploring, filtering, preprocessing, querying, and visualization of event data. Different executions of the process are summarized by grouping them into process execution variants, which are visualized within the [*Variant Explorer*](#variant-explorer).
  Cortado also provides [*Variant Querying*](#variant-querying), which includes a query language designed specifically for querying variants. Additionally, Cortado allows for the specification of time granularity, fixing a typo in docs which influences the ordering of activities within variants. Furthermore, Cortado allows manual extraction
  and mining of frequent patterns through [*Frequent Pattern Mining*](#variant-frequent-pattern-mining).
  

##### Incremental process discovery
  
  A subset of variants or variant fragments can be selected by the user to initially discover and then incrementally add to the process model under construction during [*Incremental Process Discovery*](#incremental-process-discovery).  

##### Conformance checking 

  Cortado implements alignments, a state-of-the-art conformance checking technique that provides diagnostics on the mismatches between the observed (i.e., event data) and modeled process behavior (i.e., the process model). 
  The user can compare the process model with the event data at any time during incremental process discovery allowing them to make informed decisions on which variants to add further. It also provides an overview of the degree of observed behavior which is covered in the current process model.

##### Temporal performance analysis

  Cortado features [*Temporal Performance Analysis*](#temporal-performance-analysis), allowing, for example, the identification of slow process stages or activities, i.e., bottlenecks within the process. Temporal performance statistics can allow user to know which behavior to add to the process model incrementally based on any performance requirements.  


&nbsp;

A simplified overview of Cortado's functionality is depicted in the following figure:

<img class="large" src="./assets/doc/screenshots/introduction/overview.png" style="max-width:700px;">

# Variant Handling

## Variant Explorer

In the Variant Explorer, users can get a comprehensive list of all variants present in the loaded event log. Unlike classical sequential variants found in other process mining tools, the Variant Explorer captures additional parallel behavior. The explorer also lists [*Variant Fragments*](#variant-fragments). 

<img class="large" src="./assets/doc/screenshots/variant_explorer/standard-view.png">

&nbsp;

🔴 There are different views on the variants, including:

- **Standard View:** Provides general information about each variant.
- **Performance View:** Refer to section [*Temporal Performance Analysis*](#temporal-performance-analysis).
- **Conformance View:** Refer to section [*Conformance Analysis*](#conformance-analysis).

🟢 For each variant, the explorer displays its frequency within the log and the number of sub-variants it has.

🟣 Variants can be selected for discovering an initial model (<i class="bi bi-diagram-2-fill btn-icon">discover initial model</i>), and they can also be added incrementally (<i class="bi bi-plus-lg btn-icon">add variant(s) to model</i>). When discovering an initial model, no variant fragments (infixes, prefixes, suffixes) may be selected.

🔵 Variants can also be deleted by hovering over a variant row and clicking the deletion icon.

🟡 Besides that, there are multiple actions available from the <i class="bi bi-tools btn-icon"></i>`Functions` dropdown menu within the toolbar of the variant explorer. For these functionalities, refer to the corresponding sections.

When an initial model is present, conformance is available within the standard view. Click the (<i class="bi bi-question-square btn-icon"></i>) button for individual variant conformance or use (<i class="bi bi-layers-fill btn-icon">conformance check</i>) for all variants. For more detailed conformance insights, refer to the [*Conformance Analysis*](#conformance-analysis) section.


Beneath the listed variants, there are also statistics displayed for the entire event log, i.e. how many traces/variants are fitting the model or are currently selected.

### Variant Information Explorer
<img class="medium" src="./assets/doc/screenshots/variant_explorer/variant_info_explorer_open.png"> <br>

By clicking on the variant's <em>count</em> in <em>Variant Explorer</em>, a new <em>Variant Information Explorer</em> window opens in the stack of <em>Variant Explorer</em>. In the window, all cases of the selected variant are listed along with their information including <em>case ID, earliest, latest timestamp,</em> and <em>duration</em>. The <em>duration</em> column only exists if the starting time exists in the log. All the columns can also be sorted.

<img class="medium" src="./assets/doc/screenshots/variant_explorer/variant_info_explorer_detail.png"> <br>

### Case Information Explorer
<img class="medium" src="./assets/doc/screenshots/variant_explorer/case_explorer_open.png"><br>

By clicking on the <em>case ID</em> in <em>Variant Information Explorer</em>, a new <em>Case Information Explorer</em> window opens in the stack of <em>Variant Explorer</em>. In <em>Case Information Explorer</em>, the events of the selected case are listed in time order, with their information including <em>starting timestamp, ending timestamp, duration,</em> and <em>resource</em> (when present) of the event.

<img class="medium" src="./assets/doc/screenshots/variant_explorer/case_explorer_detail.png"><br>

### Variant Sorting

From the dropdown <i class="bi bi-sort-alpha-down btn-icon"></i>`Sorting` one can sort the listed variants based on different criteria:
- activites: the total number of activties in the event log
- conformance: how the variant conformance is (unknown, fitting and non-fitting)
- frequency: the frequency of variant in event log
- length: the length of the variant
- sub-variants: the number of sub-variants
- user-created: whether or not the variants are user-created (trace-fragments or modelled)


### Collapsing Activity Loops

From the <i class="bi bi-tools btn-icon"></i>`Functions` dropdown menu one can collapse activities occuring multiple times within a trace into looped activites. This is useful for certain event logs where activities repeat very often.
Certain features may be disabled as they are not working with the collapsed loops.


### Low-level Variants

By clicking on the number of sub-variants for a variant, users can inspect the corresponding low-level variants. For each sub-variant, the order in which the starting and ending of activities occur is displayed. Note that the length of the nodes does not correspond to a temporal length of the activity but only to how it started and ended relative to others.


## Variant Clustering

Variant clustering can be used for listing the variants grouped into clusters in the Variant Explorer view. This allows for a convenient way to organize and access similar variants in their respective clusters.

In the Variant Explorer view, clustering settings can be accessed using <i class="bi bi-grid-1x2 btn-icon"></i>`Variant clustering settings` option in the <i class="bi bi-tools btn-icon"></i>`Functions` dropdown menu.

| <img class="small" src="./assets/doc/screenshots/variant_handling/variant_clustering/clustering_dialog.png"> |
-

### Clustering Methods

The Clustering Method dropdown allows for selection of the clustering method. The following clustering techniques are included:

#### Agglomerative edit distance clustering

- Using this technique, variants are represented as trees and their edit distances are pairwise compared and used as a distance measure between variants during clustering.
- Having selected `Agglomerative edit distance clustering`, the second input field can be used to specify the `Max. Variant Edit Distance Within a Cluster`

#### Label vector clustering

- Using this technique, each variant is represented by a vector containing labels of the activites. The order of activities is ignored while forming these vectors. Distances between these vector representations are used for forming the variant clusters.
- Having selected `Label vector clustering`, the second input field can be used to specify the `Number of Clusters`

&nbsp;

After selection of the desired settings, click <i class="bi bi-save btn-icon"></i>`Apply` to apply the settings and cluster all variants in Variant Explorer.

<i class="bi bi-arrow-clockwise btn-icon"></i>`Reset` can be used to discard the clusters and restore to the default list of variants.

### Cluster Information

After applying clustering, variants are grouped in their respective clusters as shown below:

- Using the <i class="bi bi-chevron-down btn-icon"></i> toggle, each cluster can be hidden or expanded.
- Using <i class="bi bi-sort-alpha-down btn-icon"></i>, each cluster can be individually sorted. Note that using the global sorting of Variant Explorer view overrides the sorting of individual clusters.
- Each cluster information bar shows the number of variants and the number traces in that cluster.

|<img class="small" src="./assets/doc/screenshots/variant_handling/variant_clustering/clustered_variant_explorer.png">|
-

## Variant Querying

With variant querying, the user can enter and execute a query to search for variant with specific requirements.
Only variants which fulfill the query are then shown in the Variant Explorer.
Additionally, these variants can then be deleted from the pool of variants.
Another option is to delete everything except those variants returned by the query.

### Textual Variant Query Language

The textual variant querying window can be accessed by clicking <i class="bi bi-funnel btn-icon"></i>`Variant Query` from the Variant Explorers bottom right corner. 
Variant queries support autocompletion. Either click on of the suggestions with your cursor or select one by using the arrow keys on your keyboard and then complete it by pressing `<Tab>` your keyboard.

A valid **Query** is made up of **Activities** and **Operators**, which together form
expressions that can be linked by logical operators to form more complex queries.
For syntactic reasons, every query ends with a semicolon `;`.


#### Activities and Groups

Groups can be used both in unary and binary operators to replace single
activities. However, this is restricted to only one side of a binary
expression. In case of binary expressions, if the group is located on
the left-side of the expression, it is evaluated by simply checking for
every member of the group and the right-hand side, if the expression
would be fulfilled. The case of a right-hand side group will be covered
below.

| Activities            | Meaning                                                                                                   |
|-----------------------|-----------------------------------------------------------------------------------------------------------|
| `'Activity'`          | Activity names are written in single quotes                                                               |
| `ANY{'A','B'}`        | Evaluated in an expression, returns true if any activity for the operator returns true                    |
| `ALL{'A','B'}`        | Evaluated in an expression, returns true if all activities for the operator returns true                  |
| `~ [Group]`           | Represents the group consisting of all activities besides the activites in the curly braces of the *Group*|

#### Operators

Operators express the behavior that activities or groups of activities need to fullfill for being included in the result of the query.
They come either as **unary** or **binary** operators, which express the relationships
between a single or multiple activities and the variant. As an example for a unary
operator, the following is a query made from a single unary expression that checks
if the activity `'A'` is an event happening in the variant:

`'A' isContained;`

Similarly, a query from a binary expression that checks if every
`'A'` activity in the variant is followed by a `'B'` activity, can be written as:

`'A' isDirectlyFollowed 'B';`

##### Unary Operators
Unary operators express the relationship between a single activity and the
variant. The following query evaluates to true if `'A'` is a start activity of the variant:

`'A' isStart;`

Note that it is not necessarily a unique start activity.


| Unary Operator       | Short Form | Meaning                                               |
|----------------------|------------|-------------------------------------------------------|
| `[Act] isStart`      | `isS`      | Returns true if *act* is a start activity             |
| `[Act] isEnd`        | `isE`      | Returns true if *act* is an end activity              |
| `[Act] isContained`  | `isC`      | Returns true if *act* is contained inside the variant |

##### Binary Operators


Binary Operators express the relationship between multiple activities in a variant.
For example, `'A' isConcurrent 'B';` is fulfilled, if every occurrence of
`'A'` happens concurrently to a `'B'` activity. To add further expressive power, groups can be
used on the right-hand side of a binary expression to capture some deeper relations.
That is the query `'A' isDF ANY {'B','C'};` is fulfilled, if every `'A'` activity is directly followed by an `'B'` or `'C'` activity.
This is different to the interpretation of every `'A'` needing to be followed by a `'B'` or every `'A'` being followed by a `'C'`.

| Binary Operator                     | Short Form | Meaning                                                  |
|-------------------------------------|------------|----------------------------------------------------------|
| `[Act1] isDirectlyFollowed [Act2]`  | `isDF`     | Returns true if *Act1* always directly-follows *Act2*    |
| `[Act1] isEventuallyFollowed [Ac2]` | `isEF`     | Returns true if *Act1* always follows *Act2*             |
| `[Act1] isParallel [Act2]`          | `isP`      | Returns true if *Act1* always happens parallel to *Act2* |

#### Quantifiers

Quantifiers can be used to check for the frequency of relations. Instead
of checking if `'A'` is just contained any
number of times, `'A' isContained > 2;` will only return true, if `'A'` appears at least 3 times in the variant.
For binary expressions, this works similarly, thus `'A' isDF 'B' = 2;`, will return true if `'A'` is directly-followed 2
times by `'B'` in the variant. Using Quantifiers in conjunction with Groups need some attention,
as the right-hand side rules also apply here. Thus, `'A' isDF ALL { 'B', 'C'} > 1;` will only be evaluated as true if at least
two A activities are followed by both a `'B'` and a `'C'` activity.

| Quantifier          | Meaning                                                               |
|---------------------|-----------------------------------------------------------------------|
| `[Exp] > [Number]`  | Returns true if *Exp* appears more than *Number* of times in a variant|
| `[Exp] = [Number]`  | Returns true if *Exp* appears exactly *Number* times in a variant     |
| `[Exp] < [Number]`  | Returns true if *Exp* appears less than *Number* of times in a variant|

#### Combining Expressions with Logical Operators


Different unary and binary expressions can be linked using logical operators to build complex
queries. If we for example want to select all variants in which activity `'A'` is either
directly followed by activity `'B'` or eventually followed by activity `'E'`, we can write the
following query:

`'A' isDF 'B' OR 'A' isEF 'E';`

When linking multiple expressions, `AND` and `OR` operators linking expressions can be nested
inside each other by using `( )` parenthesis. We can use this to expand our previous
example by requiring that now every `'A'` activity needs to be followed by an`'E'` activity and
that every `'E'` needs to be followed by an `'F'` activity:

`'A' isDF 'B' OR 'A' isEF 'E';`

`'A' isDF 'B' OR ( 'A' isEF 'E' AND 'E' isEF 'F' );`

Multiple instances of the same operator on the same level can be linked without the need of
parenthesis. `NOT` can be used to negate the expression written after it in `( )`.
As an example, if we want to get all variants that have `'B'` as the unique and only start
activity, we can write the following query:

`'B' isStart AND NOT ( ~ ANY {'B'} isStart );`

The first term checks if `'B'` is a start activity, while the second expression would be
fulfilled if any activity that is not `'B'` would be a start activity. Now, as we negate it,
the expression can only be true if `'B'` is a start activity and no other activity
is a start activity.

| Logical Operator   | Meaning                                                                |
|--------------------|------------------------------------------------------------------------|
| `[Exp1] AND [Exp2]`| Returns true if and only if *Exp1* and *Exp2* both are true            |
| `[Exp1] OR [Exp2]` | Returns true if either *Exp1* or *Exp2* is true or if both of them are |
| `NOT ( [Exp] )`    | Returns true if *Exp* is False                                         |

### Visual Variant Query Language

The <em>visual query modeler</em> allows users to manually model a variant query with several operators. It could be opened by: the head toolbar -> `Editors` -> <i class="bi bi-search btn-icon"></i>`Open Visual Query Modeler`.

<img class="medium" src="./assets/doc/screenshots/visual_query/visual_query_modeler.png">

How to model a query:

1. Select the <em>insertion strategy</em> (where to insert the activity) in the toolbar
2. Start to create a logic tree in the logic tree editor. Once you create the first query node proceed.
3. Click the colorful activity buttons with label to insert corresponding activity into the query
4. Select a chevron in the query (could be both a single activity or group), and apply an operator (either through context menu or header bar)
5. Click on the <i class="bi bi-funnel btn-icon"></i>`Filter` and test your query by selecting <i class="bi bi-file-earmark-text me-2"></i>`Filter Current Query`
6. Repeat the process until the logic tree is complete.
7. Click on the <i class="bi bi-funnel btn-icon"></i>`Filter` and execute your query by selecting <i class="bi bi-diagram-3 me-2"></i>`Filter Logic Tree`

<img class="medium" src="./assets/doc/screenshots/visual_query/model_a_visual_query.gif">

A valid **Query** is made up of **Activities** and **Operators**. Queries can be linked by logical operators to form more complex queries.
For Operators we can distinguish between *Control-Flow Operators* and *Special Placeholders*. The latter do not allow any nesting.
We provide the following Operators:

1. Parallel Operator: Model parallel patterns
3. Choice Operator: Model an XOR-Relation over a set of Activities.
4. Optional Operator: Model optional patterns
5. Loop Operator: Model repeating patterns and specify the range
6. Fallthrough Operator: Model patterns of activities without order
7. Wildcard Operator: Special Placeholder representing all possible Acitivities
8. Anything Operator: Special Placeholder representing all possible modeled patterns
9. Start Operator: Special Placeholder, offering the possibility to search for variants starting on query
10. End Operator: Special Placeholder, offering the possibility to search for variants ending on query

<img class="medium" src="./assets/doc/screenshots/visual_query/operators.png">

## Variant Fragments

Variant fragments or trace fragments are portions of the trace variants which are sequentially complete, meaning that no activity is skipped in a sequence.

For example,
<img class="xsmall" src="./assets/doc/screenshots/variant_fragments/sequentially-complete-fragment.png">

is a sequentially complete fragment of the full trace variant 

<img class="xlarge" src="./assets/doc/screenshots/variant_fragments/full-trace-variant.png">,

while   

<img class="xsmall" src="./assets/doc/screenshots/variant_fragments/sequentially-incomplete-fragment.png">

is not.

Trace fragments are in contrast to full trace executions which have a well-defined start *and* end activity. These only contain either the start activity or end activity or none.
Based on which of the activities they contain, trace fragments can be categorised into 3 kinds - **infix**, **prefix** and **suffix**. The dots preceding and/or succeeding represent the presence of other fragments before or after the one in question

* **Infix** fragments contain none of the start or end activities and hence they are preceded *and* succeeded by dots. The fragments above are examples of the same

* **Suffix** fragments contain only an end activity.
  <img class="xsmall" src="./assets/doc/screenshots/variant_fragments/suffix.png">
* **Prefix** fragments contain only an end activity.
  <img class="xsmall" src="./assets/doc/screenshots/variant_fragments/prefix.png">

Trace fragments are used and can frequently be seen in [*Incremental Discovery*](#incremental-process-discovery), [*Variant Sequentializer (Tiebreaker)*](#variant-sequentialization-tiebreaker) and [*Frequent Pattern Mining*](#variant-frequent-pattern-mining), pool of which can either be -

* manually extracted using [infix selection mode](#extracting-variant-fragments),
* automatically identified,
* discovered in the process of '[Frequent Pattern Mining](#variant-frequent-pattern-mining)', or
* manually created

### Extracting variant fragments

One way to select infixes (and add them to the pool) is through the `trace infix selection mode`. To enable it in the variant explorer, simply click on (<i class="bi bi-ui-checks-grid btn-icon">Exit trace infix selection mode</i>) option in the (<i class="bi bi-tools btn-icon">Functions</i>) menu.
With the icons on the right, one can add the current selection to the variant explorer, reset selection or select the whole variant.

|<img class="medium" src="./assets/doc/screenshots/variant_fragments/infix-selection-mode.png">|
- 


## Variant Modeler
<img class="medium" src="./assets/doc/screenshots/variant_modeler/variant_modeler.png">


The <em>variant modeler</em> allows users to manually model a variant with sequential and parallel patterns. It could be opened by: the head toolbar -> `Editors` -> <i class="bi bi-tools btn-icon"></i>`Open Variant Modeler`.

How to model a new variant:

1. Select the <em>insertion strategy</em> (where to insert the activity) in the toolbar
2. Select a chevron in current variant (could be both single activity or an activity group). If no variant has been modeled, ignore this step
3. Click the colorful activity buttons with label to insert corresponding activity into the variant
4. Click `add new variant to log` button to add the user modeled variant to the variant list

<img class="medium" src="./assets/doc/screenshots/variant_modeler/model_a_variant.gif">

Other functions in the tool:
1. Variant modeler allows the variant be displayed in 4 variant types: <em>full</em>, <em>prefix</em>, <em>infix</em>, and <em>postfix</em>.
2. View focus functions are also provided:
    - <i class="bi bi-eye-fill btn-icon"></i> <em>focus selected:</em> move the selected activity/group to the view center.
    - <i class="bi bi-arrows-fullscreen btn-icon"></i> <em>move to the start of the variant: </em>move the variant center to the view center.

## Variant Frequent Pattern Mining

As the number of variants in a process log increase, it becomes challenging for process analysts to explore event data. This section of Cortado helps mine frequent patterns in event log, or more precisely frequent *infixes* to make analysis easier and to assist incremental discovery.
Under the hood, concurrency variants are modelled as labeled, rooted, ordered trees and infixes as a specific kind of subtrees called *infix subtrees*. More about the representation can be read in one of the published [articles](https://dl.acm.org/doi/abs/10.14778/3603581.3603603). Frequent Miner can also use different algorithms with specific properties and goals - [*Valid Tree Miner*](https://dl.acm.org/doi/abs/10.14778/3603581.3603603), *Blanket Tree Miner* and *Eventually Follows Pattern Miner* being few of them.

To open the `Variant Miner Editor`, go to `Editors` &rarr; (<i class="bi bi-minecart btn-icon"><b>Open</b> Variant Miner</i>).

|<img class="medium" src="./assets/doc/screenshots/frequent_pattern_mining/editor.png">|
- 


<br/>
The editor comprises primarily of <i>three sections</i>, all of which rely heavily upon the tree representation of variants -  
<br/>
<br/>
1. shows the <b>parameter selection</b>, allowing a choice of support definition, the minimum support threshold used for mining and more
  <br/>
  <br/>
  <table>
    <thead>
        <tr style="text-align: center;">
            <th>Pattern Selection</th>
            <th>Options (if any)</th>
            <th>Function</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan=4>Support Counting Strategy</td>
            <td>Trace Transaction</td>
            <td>counts the number of occurrences of a sub-pattern, counting each occurrence as one for each trace</td>
        </tr>
        <tr>
            <td>Variant Transaction</td>
            <td>counts the number of occurrences of a sub-pattern, counting each occurrence as one for each variant</td>
        </tr>
        <tr>
            <td>Trace Root-Occurrence</td>
            <td>counts the number of occurrences of a sub-pattern having unique parents, counting each occurrence as one for each trace</td>
        </tr>
        <tr>
            <td>Variant Root-Occurrence</td>
            <td>counts the number of occurrences of a sub-pattern having unique parents, counting each occurrence as one for each variant</td>
        </tr>
        <tr>
            <td>Maximum Size</td>
            <td colspan=2>max size of the pattern. It is not the number of activities but the number of nodes in its tree representation.
              Hence, without any parallelism, it is the number of activities plus one</td>
        </tr>
        <tr>
            <td>Support</td>
            <td colspan=2>minimum number of occurrences to be counted as 'frequent'</td>
        </tr>
        <tr>
            <td>Mine prefixes and suffixes</td>
            <td colspan=2>allow mining prefixes and suffixes, instead of just infixes (see section on 'Variant Fragments' above to know more about infix/prefix/suffix)</td>
        </tr>
        <tr>
            <td>Fold loops</td>
            <td>Loop Threshold</td>
            <td>when specified as `n`, folds all `n` or more consecutive occurrences of an activity into a one single loop before mining<br><img src="./assets/doc/screenshots/frequent_pattern_mining/fold-loops.png" alt="fold-loops" class="xsmall"/></td>
        </tr>
    </tbody>
  </table>
  <br>

2. **Visualization table** shows further information on the infixes - `size`, `support`, `type`, and a `visualization` of the fragment.
   Apart from the `Type` itself, all the rest of the properties are directly taken from the parameter selection before mining. An infix subtree is of *type*
   `Maximal` if no frequent super-pattern exists and it is of *type* `Closed` if none of its proper super-patterns have the same support.  
   In addition, alignments between the infix and an existing process model, i.e., if the infix conforms to the process model, can be computed using
   the (<i class="bi bi-layers-fill btn-icon">conformance check</i>) button right above the table. Subsequently, if the infixes 'fit' to the model or not can also be seen
   in the `Fitting` column of the table. Apart from the above, it is also possible to export the mined infixes as svg for analysis,
   by clicking on (<i class="bi bi-save"></i>) button located in the top-right corner of the editor.


3. finally in the **Filters** menu, a user can choose which of the infixes to retain. Here, the option `Valid` for `Type` retains only *valid* infixes, meaning the infixes in which all elements have at least activity.
   The section at the bottom allows users to selectively filter in or out certain activities. For instance, for a particular activity, checking the box for `Filter` and turning the toggle switch for `Out/In` on, retains only the infixes *containing* the activity.
   Switching the toggle off, retains only the infixes *not* containing the activity.

## Variant Sequentialization (Tiebreaker)
<em>Variant Sequentializer</em> is a sequentialization tool which provides a function to match source pattern in variants and replace them with the target pattern. It could be opened by clicking the icon <i class="bi bi-bar-chart-steps"></i> in <em>variant explorer</em>'s toolbar:

<img class="medium" src="./assets/doc/screenshots/variant_sequentialization/how_to_open.png">

In <em>sequentializer</em>, there are two <em>pattern editors</em> to model the source pattern and target pattern, respectively.<br>

<img class="medium" src="./assets/doc/screenshots/variant_sequentialization/sequentializer.png">

In addition to sequential and parallel pattern, the <em>sequentializer</em> allows to model:<br>
1. <em>choice group</em>, which could match any combination of any activities in the group

<img class="medium" src="./assets/doc/screenshots/variant_sequentialization/choicegroup.png">

It could be created by clicking the icon <i class="bi bi-slash"></i>:

<img class="medium" src="./assets/doc/screenshots/variant_sequentialization/create_choice_group.png">

1. <em>fallthrough group</em>, which could model the case that activities in the group cannot be modeled by the combination of sequential/parallel relationship.

<img class="medium" src="./assets/doc/screenshots/variant_sequentialization/fallthroughgroup.png">

It could be created by clicking the icon <i class="bi bi-arrow-down"></i>:

<img class="medium" src="./assets/doc/screenshots/variant_sequentialization/create_fallthrough_group.png">

3. pattern with a <em>wildcard option</em> '..' to allow partial match, which represents "rest of the variant". <em>Wildcard</em> is listed beside the activity buttons.

<img class="medium" src="./assets/doc/screenshots/variant_sequentialization/wildcard.png">

Note：
1. in source pattern, only parallel variants are allowed.
2. The invalid patterns are checked when editing.
3. The activities in target pattern should be consistent with activities in the source pattern. Acitivities in target pattern editor are only enabled when they are already in the source pattern.

Here are some examples to show how variants are transformed by the <em>sequentializer</em>:

(1) <img class="xxxsmall" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_1.png"> <br>

(2) <img class="xxxsmall" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_2.png"> <br>

(3) <img class="xxxsmall" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_3.png"> <br>

(4) <img class="xxxsmall" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_4.png"> <br>

(5) <img class="xxxsmall" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_5.png"> <br>

<br>

<table style="width: 50%; border-collapse: collapse;">
  <tr>
    <td >Source Pattern</td> <td>Target Pattern</td> <td>Result for examples</td>
  </tr>

  <tr>
    <td rowspan="5" style="text-align: center;"><img class="xxxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_2.png"></td>
    <td rowspan="5" style="text-align: center;"><img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_6.png"></td>
    <td>(1) No match</td>
  </tr>
  <tr><td>(2) <img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_6.png"></td></tr>
  <tr><td>(3) No match</td></tr>
  <tr><td>(4) No match</td></tr>
  <tr><td>(5) No match</td></tr>

  <tr>
    <td rowspan="5" style="text-align: center;"><img class="xxxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_7.png"></td>
    <td rowspan="5" style="text-align: center;"><img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_8.png"></td>
    <td>(1) <img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_9.png"></td>
  </tr>
  <tr><td>(2) <img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_6.png"></td></tr>
  <tr><td>(3) No match</td></tr>
  <tr><td>(4) <img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_10.png"></td></tr>
  <tr><td>(5) <img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_9.png"></td></tr>
  
  <tr>
    <td rowspan="5" style="text-align: center;"><img class="xxxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_7.png"></td>
    <td rowspan="5" style="text-align: center;"><img class="xsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_11.png"></td>
    <td>(1) <img class="xsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_12.png"></td>
  </tr>
  <tr><td>(2) <img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_6.png"></td></tr>
  <tr><td>(3) <img class="xsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_13.png"></td></tr>
  <tr><td>(4) <img class="xsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_14.png"></td></tr>
  <tr><td>(5) <img class="xsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_12.png"></td></tr>
  
  <tr>
    <td rowspan="5" style="text-align: center;"><img class="xsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_15.png"></td>
    <td rowspan="5" style="text-align: center;"><img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_16.png"></td>
    <td>(1) No match</td>
  </tr>
  <tr><td>(2) <img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_6.png"></td></tr>
  <tr><td>(3) No match</td></tr>
  <tr><td>(4) <img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_17.png"></td></tr>
  <tr><td>(5) No match</td></tr>

  <tr>
    <td rowspan="5" style="text-align: center;"><img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_18.png"></td>
    <td rowspan="5" style="text-align: center;"><img class="xxxmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_19.png"></td>
    <td>(1) <img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_20.png"></td>
  </tr>
  <tr><td>(2) <img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_6.png"></td></tr>
  <tr><td>(3) <img class="xsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_21.png"></td></tr>
  <tr><td>(4) <img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_17.png"></td></tr>
  <tr><td>(5) <img class="xxsmall-img" src="./assets/doc/screenshots/variant_sequentialization/sequentializer_examples_20.png"></td></tr>
</table>

# Process Discovery

## Visualizing and Editing Process Models

### Process Tree Editor

Process tree editor tab is open by default in the top pane, it can also be accessed using <i class="bi bi-diagram-2 btn-icon"></i> `Open Process Tree Editor` option in `Editors` dropdown menu. The `Process Tree Editor` tab is also always available in the list of tabs to the left of the top pane.
After a tree is available in the process tree editor by either importing or through discovery, it can be edited in the following ways.

#### Selecting Nodes for Updates

A tree node (either activity or operator) can be selected for updates by clicking on it. 

* After selection of a node, all buttons of updates available for that node are enabled. 
* Clicking the <i class="bi bi-x-circle btn-icon"></i>`clear selection` button or clicking the node again, clears that selection.

A selected node is highlighted with a red border as follows:

|<img class="medium" src="./assets/doc/screenshots/process_discovery/selecting_nodes_for_updates.gif">|
-

#### Inserting Nodes

New nodes available for insertion in the tree are available in the process tree toolbox. The toolbox can be revealed using the <i class="btn-icon bi bi-chevron-bar-down"></i> button at the top of the editor.

|<img class="xlarge" src="./assets/doc/screenshots/process_discovery/proc_tree_toolbox.png">|
-

##### Inserting nodes along operators

After selecting an operator node, the following choices are available:

- insert new node above the selected one (<i class="bi bi-chevron-up"></i>)
- insert new node below the selected one (<i class="bi bi-chevron-down"></i>)
- insert new node left to the selected one (<i class="bi bi-chevron-left"></i>)
- insert new node right to the selected one (<i class="bi bi-chevron-right"></i>)

Having selected the following operator and **insert new node below** option, adding an activity from the list of available activities in the toolbox adds it under the selected operator follows:

|<img class="medium" src="./assets/doc/screenshots/process_discovery/insert_node_below.gif">|
-

Similarly, adding an operator adds that operator **below** the selected operator. It works similarly for adding activities or operators **above**, to the **left** or to the **right**.

##### Inserting nodes along activities

After selecting an activity, the following choices are available:

- insert new node left to the selected one (<i class="bi bi-chevron-left"></i>)
- insert new node right to the selected one (<i class="bi bi-chevron-right"></i>)

Having selected the following activity and **insert new node right to the selected one** option, adding an activity from the list of available activities in the toolbox adds it to the right of the selected activity as follows:

|<img class="medium" src="./assets/doc/screenshots/process_discovery/insert_node_right.gif">|
-

Similarly, adding an operator adds that operator **to the right** the selected activity. It works similarly for adding activities or operators **to the left**.

#### Replacing Nodes

The `replace the currently selected node` (<i class="bi bi-arrow-repeat"></i>) option can be used to replace a selected activity or operator node with either an activity or an operator node from the list of available activities and operators in the toolbox.

Having selected an activity and **replace the currently selected node** option, choosing another activity from the toolbox replaces the selected activity as follows:

|<img class="medium" src="./assets/doc/screenshots/process_discovery/replace_node.gif">|
-

Similarly, choosing an operator node from the toolbox **replaces** the selected activity with the selected operator. It works similarly for **replacing** selected operators with either operators or activities form the list of available operators and activities in the toolbox.

#### Removing Nodes

Selecting an operator node or an activity and clicking the <i class="bi bi-trash btn-icon"></i>`remove selected node(s)` button removes that activity or the operator node along with all child nodes.

Having selected an operator node and removing it results as follows:

|<img class="medium" src="./assets/doc/screenshots/process_discovery/remove_node.gif">|
-

#### Shifting Nodes

Selecting an operator node or an activity and clicking the <i class="bi bi-chevron-double-left btn-icon"></i>`shift selected node(s) to left` or <i class="bi bi-chevron-double-right btn-icon"></i>`shift selected node(s) to right` button **shifts** the selected node to the left or to the right respectively.
The shift to right or to the left is with respect to the sibling node(s) of the selected node under a single operator.

Having selected the following operator node and clicking the <i class="bi bi-chevron-double-left btn-icon"></i>`shift selected node(s) to left` button **shifts** the operator node to the left as follows:

|<img class="medium" src="./assets/doc/screenshots/process_discovery/shift_pt_node.gif">|
-

#### Applying Reduction Rules

Selecting an operator node and clicking the <i class="bi bi-diagram-2"></i> button applies **reduction rules** to remove redundant and unnecessary nodes from that subtree as follows:

|<img class="medium" src="./assets/doc/screenshots/process_discovery/reduction_rules.gif">|
-

#### (Un)Freezing Subtrees

Freezing a subtree prevents that subtree from being updated during the incremental discovery process and this subtree always remains in the tree.

Selecting an operator node and clicking the <i class="bi bi-snow btn-icon"></i>`(un)freeze subtrees` button **freezes** the subtree under that operator node. The frozen subtree is highlighted blue as seen below:

|<img class="medium" src="./assets/doc/screenshots/process_discovery/freeze_node.gif">|
-

Similarly, selecting root operator node of an already frozen subtree and clicking the <i class="bi bi-snow btn-icon"></i>`(un)freeze subtrees` button unfreezes that subtree. After unfreezing, that subtree may be updated diring the incremental discovery process and its presence is no longer ensured.

#### Undo/Redo Applied Changes

During the process of updating the tree, history is maintained and the edits can be undone or redone using the <i class="bi bi-arrow-counterclockwise btn-icon"></i>`undo` and <i class="bi bi-arrow-clockwise btn-icon"></i>`redo` buttons.

#### Exporting the Model

The current tree in the process tree editor can be exported (.svg) using the <i class="bi bi-save"></i>`export the tree as an .svg` button.

### BPMN-Visualizer

BPMN visualizer can be accessed using <i class="bi bi-diagram-2 btn-icon rotate-270"></i> `Open BPMN Viewer` option in `Editors` dropdown menu. The `BPMN Viewer` tab is also available in the list of tabs to the left of the top pane after it was accessed.
After a tree is available in the process tree editor by either importing or through discovery, the BPMN representation of that process tree is available in the BPMN viewer.

#### Selecting Nodes for Updates

A node can be selected for updates by clicking on it. 

* After selection of a node, all buttons of updates available for that node are enabled. 
* Clicking the <i class="bi bi-x-circle btn-icon"></i>`clear selection` button or clicking the node again, clears that selection.

A selected node is highlighted through a red border as follows:

|<img class="medium" src="./assets/doc/screenshots/process_discovery/select_node_bpmn.gif">|
-

#### Removing Nodes

Selecting a node and clicking the <i class="bi bi-trash btn-icon"></i>`remove selected node(s)` button removes that node as well as the relevant connected nodes from the BPMN model.

Having selected a node and removing it results as follows:

|<img class="medium" src="./assets/doc/screenshots/process_discovery/remove_bpmn_node.gif">|
-

#### Exporting the Model

The current BPMN model in the BPMN viewer can be exported (.svg) using the <i class="bi bi-save"></i>`export the model as an .svg` button.


## Incremental Process Discovery

### Idea and Overview

Cortado uses incremental process discovery which involves incrementally discovering a process model by adding trace by trace to an existing process model. 
Thereby, the process model under construction gets incrementally extended. Using the trace to be added in an iteration, specific parts 
of the process tree which must be altered to fit the trace are identified. This is followed by updates to those identified parts which 
allow the trace to fit the process tree. 

After discovering or importing an initial process tree, trace(s) can be chosen for incrementally adding them to the process tree.  

### Discovering Initial Model

* An initial model can be discovered using the following steps:
  1. Select variant(s) in the `Variant Explorer`
     * Infix, prefix and suffix can not be selected for the incremental process discovery.
  2. Press the <i class="bi bi-diagram-2-fill btn-icon"></i>`discover initial model` button
  3. The discovered process tree would be displayed in the `Process Tree Editor` as follows:

|<img class="large" src="./assets/doc/screenshots/process_discovery/discover_initial_model.gif">|
-

### Incrementally Adding Variants

* Variant(s) can be incrementally added to the process model using the following steps:
  1. Select variant(s) in the `Variant Explorer` that are not yet added to the process tree.
  2. Press the <i class="bi bi-plus-lg btn-icon"></i>`add variant(s) to model` button.
     * After selecting and adding to the model, the variant is in the language of the process tree and should not be un-selected.
     * All variants in the variant explorer can be selected for the incremental process discovery including:
       * Variants from the log.
       * Variant fragments.
       * Variants from the `Variant Modeler`.
  3. The modified process tree (which the selecting traces fit to) would be displayed in the `Process Tree Editor` as follows:

|<img class="large" src="./assets/doc/screenshots/process_discovery/incremental_trace_addition.gif">|
-

# Temporal Performance Analysis

## Model-independent performance analysis
When opening the Performance View from the side bar, the performance of each variant is calculated, which may take a while depending on the size of the event log. 

<img class="large" src="./assets/doc/screenshots/variant_explorer/performance-view.png">

In this view the variants are no longer uniquely colored to be differentiated but based on their service times. Additionally, there are now nodes displayed in-between activites to show the waiting times. These are colored using a separate color scale to show their waiting times. 

Both color maps can be seen in a sub-tab from the `Variant Performance` tab.

<img class="large" src="./assets/doc/screenshots/temporal_performance_analysis/variant-performance_color-map.png">

Here, the used statistic for the color maps can be changed. By default, they show the mean values of all instances for each variant. Other statisics are their minimum, maximum or standard deviation. Upon change the color map will be immediatley be updated.

To get further insight into the performance of certain parts of a variant, let it be single activites, waiting nodes or parallel sections, one can simply click on them in the Variant Explorer and inspect their service or waiting times in the `Selection` sub-tab of the `Variant Performance` tab.

<img class="large" src="./assets/doc/screenshots/temporal_performance_analysis/variant-performance_selection.png">


## Model-based performance analysis 
For understanding the performance of a process model, one can project the performance of selected variants onto the model from the Performance View. 

<img class="large" src="./assets/doc/screenshots/temporal_performance_analysis/model-performance_projection.png">

&nbsp;

🔴 When there is a model present, there will be two additional columns in the Variant Explorer, namely `Model Projection` and by default `service time (mean)`.

On the one hand, by clicking the toggle in the `Model Projection` column, the variant will be added to the pool of projected variant. On the other hand, unclicking the toggle of already projected variants will remove them again from the pool. To clear the whole pool, one can click (<i class="bi bi-x-circle-fill btn-icon"></i>) in the header of the `Model Projection` column.

Please note, that in most cases, it only makes sense to project variants that are actually fitting the process tree as otherwise the projection is not complete.
Because of that, there will be a warning sign displayed for variant that are actually not fitting.

The other column shows in the default setting the mean service overall model performance of the variant.

🟢 Further information can be gained from `Model Performance` tab. Here, in the `Selection` subtab, the *service time*, *waiting time*, *cycle time* and *idle time* are shown for the selection made within the model.

🟣 The same information can be gained for certain process tree nodes by hovering over them. 

In the `Color Map` subtab, adjustments can be made to how the model is colored and the statistics are aggregated.

<img class="large" src="./assets/doc/screenshots/temporal_performance_analysis/model-performance_color-map.png">

&nbsp;

One can choose which of the four performance times will be used for the projection as well between the statistical measure (mean, min, max, stdev). 

The changes made to this will also change what will be displayed in the variants explorer column.

# Conformance Analysis

To compare the discovered process model, including intermediate process models within the incremental discovery approach, with the event log provided, Cortado features conformance checking.
Cortado implements alignments, i.e., a state-of-the-art conformance checking technique that provides diagnostics on the mismatches between the observed (i.e., event data) and modeled process behavior (i.e., the process model).
Consequently, the user can compare the process model with the event data at any time during incremental process discovery.

<img class="large" src="./assets/doc/screenshots/conformance_analysis/standard_view.png">

&nbsp;

When an initial model is already present, a user can calculate conformance statistics of a variant using the (<i class="bi bi-question-square btn-icon"> (re)calculate conformance statistics</i>) button (see box labelled 1. in the image above) next to the checkboxes.
Alternatively, it is also possible to (re)calculate statistics for all variants at once using the (<i class="bi bi-layers-fill btn-icon"> conformance check</i>) button (see box 3.)
After the calculations, either one of the statuses is possible -

- <i class="bi bi-check-square font-large text-success"></i> <em>variant fits the model</em>
- <i class="bi bi-x-square font-large text-danger"></i> <em>variant does not fit the model</em>

The number of fitting traces and variants can also be seen at the bottom (see box 2.)

After calculating statistics for a variant(s), if the model changes (using the process tree editor, for example), the statistics are consequently affected, too.
This is indicated through another status -

- <i class="bi bi-check-square font-large text-warning"></i><i class="bi bi-x-square font-large text-warning"></i> <em>outdated results (model has changed)</em>

which calls for the recalculation of statistics using one of the two ways mentioned above.

For detailed view on the analysis, Cortado also dedicates a separate tab `Conformance View`.

<img class="large" src="./assets/doc/screenshots/conformance_analysis/conformance_view.png">

&nbsp;

The variant visualizations in this tab
represent the projected alignment results of all the sequentializations of that particular variant. Since it is cumbersome to browse through each alignment visualisation individually, instead of projecting one alignment to one variant at a time, Cortado also allows to project
all the alignment results into the model through <em>aggregation</em>. The method of aggregation can be selected from the dropdown in the `Color Maps` tab towards the right panel. Two options are available -
- aggregation by <em>equal weights</em>, or
- aggregation <em>weighted by their log frequency</em>

Using this technique, it becomes easier to locate deviations, if the misalignments are concentrated at  certain tasks in the model.
To project alignments onto the model, click on the `model projection` toggle switch to the left of a variant. The percentage value displayed post computation indicates the `tree conformance` of the projected set of variants, that is, it describes how many nodes contained in a sub-tree are properly aligned.

`Color Maps` to the right complement the visualisation, in which the percentage values indicate the 'degree' of the respective type of conformance. Darker the color, better the alignment.

# Import / Export

## Log Export

One can export the event-log with various setting through the guided event-log exporter.
It could be opened by: the head toolbar -> `Files` -> <b>Export</b> Log as XES (<samp class="text-primary fw-bold">.xes</samp>)</span>.

The steps for including user-created variants or trace fragments will only be accesible if a variant of that type is present in the Variant Explorer.

# Software Architecture

Cortado is an end-user process mining tool offered as a standalone desktop application supporting all major operating systems. Cortado is built using a Python based backend and a frontend based on web development technologies.

The following figure illustrates the main architecture of Cortado:

<img class="large" src="./assets/doc/screenshots/software_architecture/architecture.png">

#### Backend
The library Cortado-core is central to Cortado's backend. The library implements algorithms and methods for incremental process discovery, temporal performance analysis, process execution variant detection, variant querying and conformance checking. The library can also be embedded and utilized in other software applications and is considered an independent contribution.

The backend around Cortado-core is an application programming interface for the frontend i.e. it bundles functionality from Cortado-core into webservices tailored to the frontend using the framework FastAPI. Additionally, PyInstaller is used to bundle the backend, including Cortado-core library into a single executable package.

#### Frontend

The frontend is developed as a web application using web development languages including HTML, CSS, Javascript and Typescript bundled in Angular as an application framework. For various visualizations, the javascript library d3.js is used.

Additionally, Electron framework is used to produce cross-platform desktop applications.

#### Repository

<a href="github.com/cortado-tool/cortado#readme" style="text-decoration:none"><i class="m-1 bi bi-link-45deg"></i>github.com/cortado-tool/cortado#readme</a>

<p style="text-align: center;"><a href="https://cortado.fit.fraunhofer.de/#contact" style="text-decoration:none"><b>Contact <i class="m-1 bi bi-box-arrow-up-right"></i></b></a></p>