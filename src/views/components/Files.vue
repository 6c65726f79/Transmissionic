<template>
    <VirtualScroll v-bind="$attrs" ref="content" :items="currentDirectoryContent" :item-size="64" key-field="name">
      
      <template v-slot:start >
            
        <div class="breadcrumb swiper-no-swiping" ref="breadcrumb">
            <div :class="{ active: breadcrumb.length==0 }">
              <a @click="selectDirectory(0)"><ion-icon class="home" :ios="homeOutline" :md="homeSharp"></ion-icon></a>
              <ion-icon class="chevron" :icon="chevronForwardOutline"></ion-icon>
            </div>
            <div v-for="(dir,index) in breadcrumb" v-bind:key="dir" :class="{ active: index == breadcrumb.length-1 }">
              <a @click="selectDirectory(index+1)">{{dir}}</a>
              <ion-icon class="chevron" :icon="chevronForwardOutline" v-if="index != breadcrumb.length-1"></ion-icon>
            </div>
        </div>
        <div v-if="currentDirectory!=''" class="back click" @click="selectDirectory(-1)">
          <div class="side">
            <ion-icon :ios="returnUpBackOutline" :md="returnUpBackSharp"></ion-icon>
          </div>
          ..
        </div>
      </template>

      <template v-slot:default="{item}">
        <div :class="{file:true,actions:actions}">
          <div class="side">
            <ion-checkbox v-bind="checkedAttributes(item.ids)" v-on:ionChange="checboxUpdate($event,item.ids)"></ion-checkbox>
          </div>
          <div :class="{ middle: true, click: item.folder }" @click="fileAction(item)" @contextmenu="fileTitle(item.name, $event)">
            <div class="name">
              {{item.name}}
            </div>
            <div class="details">
              <ion-icon v-if="getPriority(item.ids)==1" color="success" :ios="caretUpOutline" :md="caretUpSharp"></ion-icon>
              <ion-icon v-if="getPriority(item.ids)==-1" color="danger" :ios="caretDownOutline" :md="caretDownSharp"></ion-icon>
              <ion-icon 
                color="medium"
                :ios="item.folder ? folderOpenOutline : documentOutline"
                :md="item.folder ? folderOpenSharp : documentSharp">
              </ion-icon>

              <template v-if="item.bytesCompleted!=undefined && item.bytesCompleted!=item.length">
                &nbsp;{{ Utils.formatBytes(item.bytesCompleted) }} {{ Locale.of }}
              </template>
              {{ Utils.formatBytes(item.length) }}
              <template v-if="item.bytesCompleted!=undefined">
                ({{ Utils.getPercent(item.bytesCompleted/item.length) }})
              </template>
            </div>
          </div>
          <div v-if="actions" class="side click" @click="fileActions(item)">
            <ion-icon :ios="ellipsisVerticalOutline" :md="ellipsisVerticalSharp">
            </ion-icon>
          </div>
        </div>
      </template>

    </VirtualScroll>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import { 
  alertController,
  actionSheetController,
  IonCheckbox,
  IonIcon,
} from '@ionic/vue';
import {
  homeOutline,
  homeSharp,
  chevronForwardOutline,
  returnUpBackOutline,
  returnUpBackSharp,
  caretUpOutline,
  caretUpSharp,
  caretDownOutline,
  caretDownSharp,
  folderOpenOutline,
  documentOutline,
  folderOpenSharp,
  documentSharp,
  ellipsisVerticalOutline,
  ellipsisVerticalSharp
} from 'ionicons/icons';
import VirtualScroll from './VirtualScroll.vue';
import { Locale } from "../../services/Locale";
import { Utils } from "../../services/Utils";
import { TransmissionRPC } from '../../services/TransmissionRPC';
import * as _ from 'lodash';

export default defineComponent({
  props:{
    actions: {
      type: Boolean,
      required: false,
      default: () => true,
    },
  },
  components: {
    VirtualScroll,
    IonCheckbox,
    IonIcon,
  },
  data() {
    return {
      id:null as any,
      details:{} as Record<string,any>,
      fileStats:{} as Record<string,any>,
      currentDirectory:"",
    }
  },
  setup() {
    return { 
      Utils,
      Locale,
      homeOutline,
      homeSharp,
      chevronForwardOutline,
      returnUpBackOutline,
      returnUpBackSharp,
      caretUpOutline,
      caretUpSharp,
      caretDownOutline,
      caretDownSharp,
      folderOpenOutline,
      documentOutline,
      folderOpenSharp,
      documentSharp,
      ellipsisVerticalOutline,
      ellipsisVerticalSharp
    }
  },
  created() {
    this.id = inject('id') as number;
    this.details = inject('details') as Record<string,any>;
    this.fileStats = inject('fileStats') as Record<string,any>;
    this.currentDirectory = inject('currentDirectory') as string;
  },
  mounted() {
    // Custom scrollbar for Web Browser and Electron
    Utils.customScrollbar(this.$refs.breadcrumb, false, false);
  },
  watch: {
    currentDirectory() {
      this.$nextTick(() => {
        this.setScroll();
      }) 
    }
  },
  computed: {
    breadcrumb: function(): Array<string>{
      const directories: Array<string>=this.currentDirectory.split('/')
      return directories.slice(0,directories.length-1);
    },
    // Return a list of directory/file contained in current directory from file list
    currentDirectoryContent: function (): Array<any> {
      let result=[] as Array<any>;
      const folders={} as Record<string,any>;
      const files=this.details.files;
      for(const id in files){
        if(files[id].name.startsWith(this.currentDirectory)){
          // File is contained in current directory or sub directory
          const currentName = files[id].name.substr(this.currentDirectory.length);
          const slashCount = (currentName.match(/\//g) || []).length;
          if(slashCount==0){
            // File is contained in current directory
            const resultFile = {
              name:currentName,
              bytesCompleted:files[id].bytesCompleted,
              length:files[id].length,
              folder:false,
              ids:[id]
            }
            result.push(resultFile);
          }
          else {
            //  File is contained in sub directory
            const dirName: string=currentName.substr(0,currentName.indexOf("/"));
            if(!Object.keys(folders).includes(dirName)){
              // Create folder details
              const resultFile = {
                name:dirName,
                length:files[id].length,
                folder:true,
                ids:[id]
              } as Record<string,any>
              if(typeof files[id].bytesCompleted!="undefined"){
                resultFile.bytesCompleted=files[id].bytesCompleted
              }
              folders[dirName]=resultFile;
            }
            else {
              // Update folder details
              folders[dirName].length+=files[id].length;
              folders[dirName].ids.push(id);
              if(typeof folders[dirName].bytesCompleted!="undefined"){
                folders[dirName].bytesCompleted+=files[id].bytesCompleted;
              }
            }
          }
        }
      }

      result = Object.values(folders).concat(result);
      result = _.orderBy(result, ['folder', item => item.name.toString().toLowerCase()], ['desc','asc']);
      
      return result;
    }
  },
  methods: {
    selectDirectory(index: number){
      const end = (index>=0) ? index : this.currentDirectory.split('/').length-2;

      let dir=this.currentDirectory.split('/').slice(0,end).join("/");
      if(end>0){
        dir+="/";
      }
      this.$emit("change-directory",dir);
    },
    fileAction(file: Record<string, any>){
      if(file.folder){
        this.$emit("change-directory",this.currentDirectory+file.name+"/");
      }
    },
    async fileTitle(title: string, e: Event){
      if(e){
        e.preventDefault();
      }
      Utils.responseToast(title)
    },
    async fileActions(file: Record<string, any>) {
      const actionSheet = await actionSheetController
        .create({
          header: file.name,
          buttons: [
            {
              text: Locale.actions.rename,
              handler: () => {
                this.fileRename(file);
              },
            },
            {
              text: Locale.priority.priority,
              handler: () => {
                this.filePriority(file);
              },
            },
            {
              text: Locale.actions.cancel,
              role: 'cancel',
            },
          ],
        });
      return actionSheet.present();
    },
    async fileRename(file: Record<string, any>){
      const alert = await alertController
        .create({
          header: Locale.actions.rename,
          inputs: [
            {
              name: 'name',
              value: file.name,
            }
          ],
          buttons: [
            {
              text: Locale.actions.cancel,
              role: 'cancel'
            },
            {
              text: Locale.ok,
              handler: (data) => {
                const currentName = this.currentDirectory+file.name;
                const args = {
                  path:currentName,
                  name:data.name
                }

                TransmissionRPC.torrentAction("rename-path", this.id, args)
                  .then(async (response) => {
                    if(response.result=="success"){
                      for(const item of this.details.files){
                        if(item.name.startsWith(currentName)){
                          item.name = item.name.replace(currentName,this.currentDirectory+data.name);
                        }
                      }
                    }
                    Utils.responseToast(response.result)
                  });
              },
            },
          ],
        });
      return alert.present();
    },
    async filePriority(file: Record<string, any>){
      const priority = this.getPriority(file.ids);
      const alert = await alertController
        .create({
          header: Locale.priority.priority,
          inputs: [
            {
              type: 'radio',
              label: Locale.priority.high,
              name: 'priority',
              value:1,
              checked: (priority==1),
            },
            {
              type: 'radio',
              label: Locale.priority.normal,
              name: 'priority',
              value:0,
              checked: (priority==0),
            },
            {
              type: 'radio',
              label: Locale.priority.low,
              name: 'priority',
              value:-1,
              checked: (priority==-1),
            }
          ],
          buttons: [
            {
              text: Locale.actions.cancel,
              role: 'cancel'
            },
            {
              text: Locale.ok,
              handler: (data) => {
                if(data!==undefined){
                  this.priorityUpdate(data, file.ids)
                }
              },
            },
          ],
        });
      return alert.present();
    },
    checkedAttributes(ids: Array<number>) {
      const isWanted = this.isWanted(ids)
      return {
        checked:(isWanted==1),
        indeterminate:(isWanted==2)
      }
    },
    checboxUpdate(e: any, ids: Array<number>) {
      ids.forEach((id) => {
        this.fileStats[id].wanted=e.detail.checked;
      });

    },
    priorityUpdate(priority: number, ids: Array<number>) {
      ids.forEach((id) => {
        this.fileStats[id].priority = priority;
      });
    },
    isWanted(ids: Array<number>): number|null {
      let result: number|null=null; // 0 = not wanted / 1 = wanted / 2 = indeterminate
      ids.forEach((id) => {
        if(this.fileStats){
          if(result===null){
            result=this.fileStats[id].wanted ? 1 : 0;
          }
          else if(this.fileStats[id].wanted != (result==1)){
            result=2;
          }
        }
      })
      return result;
    },
    getPriority(ids: Array<number>): number|null{
      let result: number|undefined|null = undefined; // -1 = low / 0 = normal / 1 = high
      ids.forEach((id) => {
        if(result===undefined){
          result = this.fileStats[id].priority
        }
        else if(this.fileStats[id].priority != result){
          result = null;
        }
      });
      return (result!==undefined) ? result : null;
    },
    setScroll(){
      const content = this.$refs.content as Record<string,any>;
      content.$el.scrollToTop();

      const breadcrumb = this.$refs.breadcrumb as Record<string,any>;
      if(breadcrumb){
        breadcrumb.scrollLeft=breadcrumb.scrollWidth;
      }
    },
  }
})
</script>

<style scoped>
.file,.back {
  height:64px;
  border-bottom: 1px solid var(--ion-border-color);
  text-align:left;
}

.file > div {
  padding:5px;
  vertical-align: top;
}

.click {
  cursor:pointer;
}

.side {
  height:64px;
  width:50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.side ion-icon {
  font-size:20px;
  margin: 18px 0px;
}

.middle {
  position:relative;
  display:inline-block;
  height:64px;
  width:calc(100% - 50px);
}

.actions .middle {
  width:calc(100% - 100px);
}

.name {
  font-size:1rem;
  line-height: 1.2rem;
  height: 38px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.details {
  font-size: 14px;
  color:var(--ion-color-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.details ion-icon {
  vertical-align: -2px;
}

/* Breadcrumb */
.breadcrumb {
  position:relative;
  list-style: none;
  height: 56px;
  color: #FFF;
  font-size: 14px;
  font-weight: bold;
  overflow: auto;
  white-space: nowrap;
  margin: 0;
  padding:0px 15px;
  text-align: left;
  display: flex;
  align-items: center;
}

.breadcrumb div:last-child {
  margin-right:15px;
  padding-right:15px;
}

.breadcrumb div {
  display: inline-block;
  color:var(--ion-color-medium);
}
.breadcrumb a {
  text-decoration: none;
  cursor:pointer;
  color:inherit;
}
.breadcrumb ion-icon {
  font-size: 16px;
  vertical-align: top;
}
.breadcrumb .chevron {
  padding: 0 5px;
  color:var(--ion-color-medium);
}
.breadcrumb div.active {
  color:var(--color);
  padding-right:15px;
}
</style>