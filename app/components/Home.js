/* eslint-disable jsx-a11y/click-events-have-key-events */
// @flow
import React, { Component } from 'react';
import { remote } from 'electron';
import styles from './Home.css';

import fs from 'fs';
import path from 'path';

const { dialog } = remote;

export default class Home extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selectedPath: '',
      oldname: '',
      newname: ''
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async getDirPath() {
    const path = await dialog.showOpenDialog({
      title: '选择文件夹',
      properties: ['openDirectory']
    });
    return path;
  }

  chooseDir() {

    // eslint-disable-next-line promise/always-return
    this.getDirPath().then(path => {

      this.setState({
        selectedPath: path.pop()
      })
    }).catch(err => {
      console.log(err, 'choose file err');
    })
  }

  oldNameChange(event) {
    this.setState({
      oldname: event.target.value
    });
  }

  newNameChange(event) {
    this.setState({
      newname: event.target.value
    });
  }

  // eslint-disable-next-line class-methods-use-this
  rename() {
    const { selectedPath, oldname, newname } = this.state;
    fs.readdir(selectedPath, (err, files) => {
      if (files.every(file => fs.statSync(path.join(selectedPath, file)).isFile())) {
        const validFileList = files.filter(file => oldname && ~file.indexOf(oldname))
        if (!validFileList.length) {
          return dialog.showMessageBox({
            title: '提示',
            type: 'error',
            message: '没有找到合理的修改文件'
          })
        }
        const updateFileList = validFileList.map(file => ({ oldname: file, newname: file.replace(oldname, newname) }))
        updateFileList.forEach(file => {
          const oldpath = path.join(selectedPath, file.oldname)
          const newpath = path.join(selectedPath, file.newname)
          fs.renameSync(oldpath, newpath)
        })
        dialog.showMessageBox({
          title: '提示',
          type: 'info',
          message: '修改成功'
        }, () => {
          this.setState({
            selectedPath: '',
            oldname: '',
            newname: ''
          })
        })
      } else {
        dialog.showMessageBox({
          title: '提示',
          type: 'error',
          message: '请选择合理的文件夹'
        })
      }
    })
  }

  render() {
    const {selectedPath, oldname, newname} = this.state;

    return (
      <div className={styles.container}>
        {
          selectedPath ? (<div className={styles['input-box']}>
            <input autoComplete="off" placeholder="路径" disabled type="text" rows="2" className={styles['input-inner--disabled']} value={selectedPath} />
            <input autoComplete="off" placeholder="请输入旧名称" type="text" rows="2" className={styles['input-inner']} value={oldname} onChange={this.oldNameChange.bind(this)} />
            <input autoComplete="off" placeholder="请输入新名称" type="text" rows="2" className={styles['input-inner']} value={newname} onChange={this.newNameChange.bind(this)} />
          </div>) : null
        }
        {
          <div className={styles['button-box']}>
            <div className={styles['button--common']} tabIndex="0" onClick={this.chooseDir.bind(this)} role="button">{ selectedPath ? '重新选择文件夹' : '选择文件夹'}</div>
            { selectedPath ?
              <div className={styles['button--common']} tabIndex="0" onClick={this.rename.bind(this)} role="button">批量改名</div>
              : null}
          </div>
        }
      </div>
    );
  }
}
