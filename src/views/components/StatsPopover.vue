<template>
  <ion-list id="stats">
    <canvas ref="canvas1" width="240" height="200"></canvas>
  </ion-list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { 
  IonList
} from '@ionic/vue';
import {
} from 'ionicons/icons';
import { Locale } from "../../services/Locale";
import { Utils } from "../../services/Utils";
import { Chart,registerables  } from "chart.js";
Chart.register(...registerables);

let chart: Chart;

const chartOptions = {
  responsive: false,
  plugins: {
    legend: {
      position: "bottom" as any
      /*display: false*/
    },
  },
  elements: {
    line: {
      tension:.5,
      borderColor: '',
      backgroundColor: '',
      borderWidth: 2,
      fill:true
    },
    point: {
      radius: 0
    }
  },
  tooltips: {
    enabled: false
  },
  scales: {
    x: {
      ticks: {
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0
      }
    },
    y: {
      ticks: {
        callback: function(value: string|number) {
            return Utils.formatBytes(parseInt(value.toString()),0,true) as string|number;
        }
      }
    }
  }   
};

export default defineComponent({
  name: 'OrderPopover',
  components: {
    IonList
  },
  data() {
    return {
      data: {
        labels: ['11:10', '', '', '', '', '', '', '', '', '', '11:34'],
        datasets: [
          {
            label: Locale.download,
            data: [435, 321, 532, 801, 1231, 1098, 732, 321, 451, 482, 513],
            borderColor: "rgb(47,223,117)",
            backgroundColor: "rgba(47,223,117,.2)"
          },
          {
            label: Locale.seed,
            data: [513, 482, 451, 321, 732, 1098, 1231, 801, 532, 321, 435],
            borderColor: "rgb(66,140,255)",
            backgroundColor: "rgba(66,140,255,.2)"
          }
        ]
      },
    }
  },
  setup() {
    Utils.pushState();

    return {
      Locale,
    };
  },
  created() {
    this.$nextTick(() => this.draw());
  },
  methods: {
    draw() {
      const canvas = this.$refs.canvas1 as HTMLCanvasElement;
      chart = new Chart(canvas, {type: 'line',options:chartOptions,data:this.data});
      console.log(chart)
    },
    addData() {
      this.data.labels.push("");
      this.data.datasets[0].data.push(Math.floor(Math.random() * 1000));
      this.data.datasets[1].data.push(Math.floor(Math.random() * 1000));
      chart.update();
    }
  }
});
</script>

<style scoped>
canvas {
  margin: auto;
}

</style>