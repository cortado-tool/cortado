import { HumanizeDurationOptions } from 'humanize-duration-ts';
import { HumanizeDurationPipe } from 'src/app/pipes/humanize-duration.pipe';
import { TreePerformance } from '../../objects/ProcessTree/ProcessTree';

export function getPerformanceTable(
  performance: TreePerformance,
  selectedPerformanceIndicator,
  selectedStatistic
): string {
  let table = '<table class="table table-dark table-striped table-bordered">';

  if (!performance) {
    return undefined;
  }

  let performanceAvailable = false;
  const options: HumanizeDurationOptions = { largest: 2, round: true };

  if (performance.service_time?.[selectedStatistic] !== undefined) {
    const serviceTime = HumanizeDurationPipe.apply(
      performance?.service_time?.[selectedStatistic] * 1000,
      options
    );
    table += `<tr>
                <td>Service Time (${selectedStatistic}):</td>
                <td>${serviceTime}</td>
              </tr>`;
    performanceAvailable = true;
  }
  if (performance.waiting_time?.[selectedStatistic] !== undefined) {
    const waitingTime = HumanizeDurationPipe.apply(
      performance.waiting_time?.[selectedStatistic] * 1000,
      options
    );
    table += `<tr>
                <td>Waiting Time (${selectedStatistic}):</td>
                <td>${waitingTime}</td>
              </tr>`;
    performanceAvailable = true;
  }
  if (performance.idle_time?.[selectedStatistic] !== undefined) {
    const idleTime = HumanizeDurationPipe.apply(
      performance.idle_time?.[selectedStatistic] * 1000,
      options
    );
    table += `<tr>
                <td>Idle Time (${selectedStatistic}):</td>
                <td>${idleTime}</td>
              </tr>`;
    performanceAvailable = true;
  }
  if (performance.cycle_time?.[selectedStatistic] !== undefined) {
    const cycleTime = HumanizeDurationPipe.apply(
      performance.cycle_time?.[selectedStatistic] * 1000,
      options
    );
    table += `<tr>
                <td>Cycle Time (${selectedStatistic}):</td>
                <td>${cycleTime}</td>
              </tr>`;
    performanceAvailable = true;
  }
  table += '</table>';
  if (performanceAvailable) {
    return table;
  }
  return undefined;
}
