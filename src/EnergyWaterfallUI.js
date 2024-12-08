import React from 'react';
import { Application, Graphics, Text, TextStyle } from 'pixi.js';
import {dB} from './Utils'
import dataStore from './DataStore';
import userInteractionStore from './UserInteractionStore';
import { observer } from 'mobx-react';
import appConfigurationStore from './AppConfigurationStore';
import ColorLegend from './ColorLegend';
import { withTranslation } from 'react-i18next';

class EnergyWaterfallUI extends React.Component {

  cellWidth = 0;
  cellHeight = 0; 

  ytickWidth = 50; 
  singleYTickHeight = 3; 
  singleYTickMargin = 7; 

  xtickHeight = 10;
  singleXTickWidth = 25;
  singleXTickMargin = 25;

  constructor(props) {
    super(props);
    this.pixiContainerRef = React.createRef();
    this.pixiApp = null;
    this.grid = [];
    this.gridEnergy = [];
    this.geoTimes = []; 
    this.detectionGraphics = []; // For detection
    this.initialized = false; 
    this.state = {numCols: 0};

    this.cellHeight = this.props.height / this.props.numRows;
    this.ytickPeriod = Math.ceil(this.props.numRows / (this.props.height / (this.singleYTickHeight + this.singleYTickMargin))); 
  }

  componentDidMount() {
    if (!this.pixiApp) {
      const app = new Application();
      this.pixiApp = app;
      dataStore.fetchDataPromise.then(() => {
        this.initialize();
      });
    }
  }

  handleCanvasClick = (event) => {
      const canvasRect = event.target.getBoundingClientRect();
      const columnClicked = Math.floor((event.clientX - canvasRect.left) / this.cellWidth);
      const rowClicked = Math.floor((event.clientY - canvasRect.top - this.xtickHeight) / this.cellHeight);

      // Ensure the clicked row is valid
      if (rowClicked >= 0 && rowClicked < this.grid.length) {
        const selectedGeoTime = this.geoTimes[rowClicked];  // Get the geoPointsTime for the clicked row
        const seletedEnergy = this.gridEnergy[rowClicked][columnClicked];
        userInteractionStore.setSelectedPoint(columnClicked);
        userInteractionStore.setSelectedTime(selectedGeoTime); 
        userInteractionStore.setSelectedEnergy(seletedEnergy); 
      }
  };

  initialize = () => {
    if (this.initialized) return; 

    const app = this.pixiApp;
    this.setState({numCols: dataStore.geoPoints.length}, ()=>{
      this.cellWidth = this.props.width / dataStore.geoPoints.length;
      app.init({
        width: this.state.numCols * this.cellWidth + this.ytickWidth,
        height: this.props.numRows * this.cellHeight + this.xtickHeight,
        backgroundColor: 0xFFFFFF,
      }).then(() => {
        this.pixiContainerRef.current.appendChild(app.canvas);

        app.canvas.addEventListener('click', this.handleCanvasClick);

        // Matrix data (initialize with random values for demonstration)
        let matrix = [];
        for (let i = 0; i < this.props.numRows; i++) {
          let row = [];
          for (let j = 0; j < this.state.numCols; j++) {
            row.push(0xFFFFFF); // Random color
          }
          matrix.push(row);
        }

        // Render matrix
        for (let i = 0; i < this.props.numRows; i++) {
          let row = [];
          let rowEnergy = [];
          for (let j = 0; j < this.state.numCols; j++) {
            let graphics = new Graphics();
            graphics.rect(j * this.cellWidth, i * this.cellHeight + this.xtickHeight, this.cellWidth, this.cellHeight).fill(matrix[i][j]);
            app.stage.addChild(graphics);
            row.push(graphics);
            rowEnergy.push(null);
          }
          this.grid.push(row);
          this.gridEnergy.push(rowEnergy);
          this.geoTimes.push(null);
        }

        // console.log(dataStore.geoPoints);


        const tickStyle = new TextStyle({
          fontFamily: 'Arial',
          fontSize: 10,
        })

        
        // Draw xticks
        this.xtickPeriod = Math.ceil(dataStore.geoPoints.length / (this.props.width / (this.singleXTickWidth + this.singleXTickMargin)));
        dataStore.geoPoints.forEach((point, index) => {
          if (!(index % this.xtickPeriod === 0)) return; 
          const text = new Text({text: point.dist.toString() + "m",  style: tickStyle});
          text.x = index * this.cellWidth;
          text.y = 0;
          app.stage.addChild(text);
        });

        // Draw yticks
        for (let i = 0; i < this.props.numRows; i+=this.ytickPeriod) {
          const text = new Text({text: (i * appConfigurationStore.appConfigurationData.refreshRate / 1000).toString() + "s",  style: tickStyle});
          text.x = this.props.width + 20;
          text.y = i * this.cellHeight + this.xtickHeight;
          app.stage.addChild(text);
        }

        this.initialized = true; 
      });
    });
  };

  componentDidUpdate(prevProps){
    // 检测准备更新状态
    /*if (userInteractionStore.isPreparingUpdate && !prevProps.isPreparingUpdate) {
      this.prepareForUpdate(); // 进行更新前的准备工作
      userInteractionStore.setPreparingUpdate(false); // 重置状态
    }*/
    
    this.update();
  }

  prepareForUpdate = () => {
    dataStore.fetchUpdatePreparationData().then((response) => {
        if (response.ok) {
            response.json().then(( (js) => {
            console.log(js);
          }))
        }
    }
    );
  }

  update = () => {
    if (!this.initialized) return;

    const { numRows, colorScale } = this.props;
    const numCols = dataStore.geoPoints.length;
    // Use the geoPointsTime for the current update
    const currentGeoPointsTime = dataStore.geoPointsTime;

    const app = this.pixiApp;

    // Generate new row with random colors for demonstration
    let newRow = [];
    let newRowEnergy = [];
    for (let j = 0; j < numCols; j++) {
      const eg = dataStore.geoPoints[j].energy;
      let color = colorScale(dB(eg));
      let graphics = new Graphics();
      graphics.rect(j * this.cellWidth, this.xtickHeight, this.cellWidth, this.cellHeight).fill(color);
      app.stage.addChild(graphics);
      newRow.push(graphics);
      newRowEnergy.push(eg);
    }

    // Keep track of the time for each row
    this.geoTimes.unshift(currentGeoPointsTime);  
    this.gridEnergy.unshift(newRowEnergy);

    // Add new row at the beginning
    this.grid.unshift(newRow);

    // Remove last row
    let lastRow = this.grid.pop();
    lastRow.forEach(cell => {app.stage.removeChild(cell); cell.destroy();});
    this.geoTimes.pop();
    this.gridEnergy.pop();

    // Shift all rows down
    for (let i = 0; i < numRows; i++) {
      this.grid[i].forEach(cell => cell.position.y += this.cellHeight);
    }

    // Remove previous detection graphics and texts
    this.detectionGraphics.forEach(graphic => {
      app.stage.removeChild(graphic);
      graphic.destroy();
    });
    this.detectionGraphics = []; // Clear the array

    // Now visualize the energyMatObjectDetections
    dataStore.energyMatObjectDetections.forEach(detection => {
      const { box, className, color } = detection;
      const { x, y, width, height } = box;

      // Translate the detection's box to grid coordinates
      const gridX = x;
      const gridY = y;
      const gridWidth = width;
      const gridHeight = height;

      // Draw the bounding box
      const boxGraphics = new Graphics().rect(
        gridX * this.cellWidth, 
        gridY * this.cellHeight + this.xtickHeight, 
        gridWidth * this.cellWidth, 
        gridHeight * this.cellHeight,
      ).fill({color:  [color[0] / 255.0, color[1] / 255.0, color[2] / 255.0, 0.3]
      });

      // boxGraphics.lineStyle(2, PIXI.utils.rgb2hex([color[0]/255, color[1]/255, color[2]/255]), 1);
      app.stage.addChild(boxGraphics);
      this.detectionGraphics.push(boxGraphics); // Store reference to the box graphic

      // Draw the class name
      const classText = new Text({
        text : this.props.t(className), 
        style: {
        fontFamily: 'Microsoft YaHei',
        fontSize: 13,
        fill: "Ivory",
        align: 'center'
      }});
      classText.x = (gridX + gridWidth / 2) * this.cellWidth - classText.width / 2;
      classText.y = (gridY + gridHeight / 2) * this.cellHeight + this.xtickHeight - classText.height / 2;
      app.stage.addChild(classText);
      this.detectionGraphics.push(classText); // Store reference to the text graphic
    });
  };

  render() {
    const { t } = this.props;

    return (<>
      <h3>{t("energyWaterfall")}</h3>
      <div className='energyContainer'>
        <div className='invisible'>{dataStore.geoPoints?.length}</div>
        <div id="energyWaterfall" ref={this.pixiContainerRef} />
        <ColorLegend width={this.props.width + 20} height={20} colorScale={this.props.colorScale}/>
      </div>
    </>);
  }
}

export default withTranslation()(observer(EnergyWaterfallUI));
