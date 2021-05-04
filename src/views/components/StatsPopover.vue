<template>
  <ion-list id="stats" lines="none">
    <ion-item>
      {{Locale.statistics}}
    </ion-item>
    <canvas ref="canvas" width="290" height="200"></canvas>
    <ion-item>
      <table>
        <tr>
          <td></td>
          <td>{{Locale.current}}</td>
          <td>{{Locale.total}}</td>
        </tr>
        <tr>
          <td>{{Locale.downloaded}}</td>
          <td>{{Utils.formatBytes(sessionStats["current-stats"].downloadedBytes)}}</td>
          <td>{{Utils.formatBytes(sessionStats["cumulative-stats"].downloadedBytes)}}</td>
        </tr>
        <tr>
          <td>{{Locale.uploaded}}</td>
          <td>{{Utils.formatBytes(sessionStats["current-stats"].uploadedBytes)}}</td>
          <td>{{Utils.formatBytes(sessionStats["cumulative-stats"].uploadedBytes)}}</td>
        </tr>
        <tr>
          <td>{{Locale.duration}}</td>
          <td>{{Utils.durationToString(sessionStats["current-stats"].secondsActive*1000)}}</td>
          <td>{{Utils.durationToString(sessionStats["cumulative-stats"].secondsActive*1000)}}</td>
        </tr>
      </table>
    </ion-item>
  </ion-list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { 
  IonList,
  IonItem,
} from '@ionic/vue';
import {
  arrowDownOutline,
  arrowUpOutline,
} from 'ionicons/icons';
import { Locale } from "../../services/Locale";
import { Utils } from "../../services/Utils";
import { Chart,registerables  } from "chart.js";
import { TransmissionRPC } from '../../services/TransmissionRPC';
Chart.register(...registerables);

let chart: Chart;
let drawInterval: any;

const chartOptions = {
  responsive: false,
  plugins: {
    legend: {
      position: "bottom" as any
    },
    tooltip: {
      enabled: false
    },
  },
  elements: {
    line: {
      borderWidth: 2,
      fill:true
    },
    point: {
      radius: 0
    }
  },
  animation: {
    duration: 0
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
          return Utils.formatBytes(parseInt(value.toString()),1,true) as string|number;
        }
      }
    }
  }   
};

export default defineComponent({
  name: 'OrderPopover',
  components: {
    IonList,
    IonItem,
  },
  data() {
    return {
      data: {
        labels: this.labels(),
        datasets: [
          {
            label: Locale.download,
            data: this.dataset1(),
            borderColor: "rgb(47,223,117)",
            backgroundColor: "rgba(47,223,117,.2)"
          },
          {
            label: Locale.seed,
            data: this.dataset2(),
            borderColor: "rgb(66,140,255)",
            backgroundColor: "rgba(66,140,255,.2)"
          }
        ]
      },
      sessionStats:TransmissionRPC.sessionStats
    }
  },
  setup() {
    Utils.pushState();

    return {
      Locale,
      Utils,
      arrowDownOutline,
      arrowUpOutline,
    };
  },
  created() {
    this.$nextTick(() => this.setDrawInterval());
  },
  beforeUnmount() {
    clearInterval(drawInterval);
  },
  methods: {
    setDrawInterval() {
      const canvas = this.$refs.canvas as HTMLCanvasElement;
      chart = new Chart(canvas, {type: 'line',options:chartOptions,data:this.data});
      drawInterval = setInterval(() => this.updateData(),10000);
    },
    updateData() {
      this.data.labels = this.labels();
      this.data.datasets[0].data = this.dataset1();
      this.data.datasets[1].data = this.dataset2();
      this.sessionStats = TransmissionRPC.sessionStats;
      chart.update();
    },
    dataset1(): any {
      return TransmissionRPC.statsHistory.map((values) => values[0] as number);
    },
    dataset2(): any {
      return TransmissionRPC.statsHistory.map((values) => values[1] as number);
    },
    labels() {
      const result=[];
      for (let i = 0; i < TransmissionRPC.statsHistory.length; i++) {
        if(i===0){
          const start = (Date.now()/1000)-(TransmissionRPC.statsHistory.length*10);
          result.push(Utils.secondsToDate(start, false, true));
        }
        else if(i===TransmissionRPC.statsHistory.length-1){
          result.push(Utils.secondsToDate(Date.now()/1000, false, true));
        }
        else {
          result.push("");
        }
      }
      return result;
    }
  }
});
</script>

<style scoped>
canvas {
  margin: auto;
}

table {
  width:100%;
  margin:5px 0px;
}
td {
  padding: 2px;
  text-align: right;
}
tr td:first-child {
  text-align: left;;
}
</style>