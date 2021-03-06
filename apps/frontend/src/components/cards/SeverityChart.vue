<template>
  <ApexPieChart
    :categories="categories"
    :series="series"
    @category-selected="onSelect"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ApexPieChart, {Category} from '@/components/generic/ApexPieChart.vue';
import {Severity} from 'inspecjs';
import {SeverityCountModule} from '@/store/severity_counts';
import {Filter} from '@/store/data_filters';
import {Prop} from 'vue-property-decorator';

/**
 * Categories property must be of type Category
 * Model is of type Severity | null - reflects selected severity
 */
@Component({
  components: {
    ApexPieChart
  }
})
export default class SeverityChart extends Vue {
  @Prop({type: String}) readonly value!: string | null;
  @Prop({type: Object, required: true}) readonly filter!: Filter;

  categories: Category<Severity>[] = [
    // { label: "Low", value: "low", icon: "SquareIcon", color: "var(--v-success-base)" },
    {label: 'Low', value: 'low', color: 'severityLow'},
    {
      label: 'Medium',
      value: 'medium',
      color: 'severityMedium'
    },
    {
      label: 'High',
      value: 'high',
      color: 'severityHigh'
    },
    {
      label: 'Critical',
      value: 'critical',
      color: 'severityCritical'
    }
  ];

  get series(): number[] {
    return [
      SeverityCountModule.low(this.filter),
      SeverityCountModule.medium(this.filter),
      SeverityCountModule.high(this.filter),
      SeverityCountModule.critical(this.filter)
    ];
  }

  onSelect(severity: Category<Severity>) {
    // In the case that the values are the same, we want to instead emit null
    if (severity.value === this.value) {
      this.$emit('input', null);
    } else {
      this.$emit('input', severity.value);
    }
  }
}
</script>
