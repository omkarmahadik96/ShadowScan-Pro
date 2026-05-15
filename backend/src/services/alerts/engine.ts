/**
 * Alert Rules Evaluator
 * Processes findings against complex condition sets to trigger notifications.
 */

export interface AlertRule {
  id: string;
  name: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'regex';
    value: string;
  }>;
  severity: string;
  notify_channels: string[];
}

export class AlertEngine {
  evaluate(finding: any, rules: AlertRule[]) {
    const triggeredRules = rules.filter(rule => {
      return rule.conditions.every(cond => {
        const fieldValue = finding[cond.field];
        if (!fieldValue) return false;

        switch (cond.operator) {
          case 'equals': return fieldValue === cond.value;
          case 'contains': return fieldValue.includes(cond.value);
          case 'regex': return new RegExp(cond.value).test(fieldValue);
          default: return false;
        }
      });
    });

    return triggeredRules;
  }
}
