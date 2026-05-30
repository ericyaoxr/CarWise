import React, { useState } from 'react';
import { Edit2, X, Check, Upload, Car } from 'lucide-react';
import type { Vehicle } from '../model/types';
import type { RecognitionTask } from '../model/types';

interface VehicleInfoEditorProps {
  vehicle: Vehicle;
  recognitionTasks: RecognitionTask[];
  onUpdateVehicle: (updates: Partial<Vehicle>) => void;
  onNavigateToRecognition: () => void;
}

export function VehicleInfoEditor({ 
  vehicle, 
  recognitionTasks, 
  onUpdateVehicle, 
  onNavigateToRecognition 
}: VehicleInfoEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState({ ...vehicle });

  // Find any recognition tasks that have VIN or tire data
  const pendingVehicleTasks = recognitionTasks.filter(
    task => task.status === '待确认' && 
    (task.candidate.vin || task.candidate.tireProductionDate || task.candidate.tireDotCode)
  );

  const handleSave = () => {
    onUpdateVehicle(editingVehicle);
    setIsEditing(false);
  };

  const handleApplyFromTask = (task: RecognitionTask) => {
    const updates: Partial<Vehicle> = {};
    if (task.candidate.vin) {
      updates.vin = task.candidate.vin as string;
    }
    if (task.candidate.tireDotCode) {
      const currentDotCodes = vehicle.tireDotCodes || [];
      const newDotCode = task.candidate.tireDotCode as string;
      if (!currentDotCodes.includes(newDotCode)) {
        updates.tireDotCodes = [...currentDotCodes, newDotCode];
      }
    }
    if (task.candidate.tireProductionDate) {
      const currentDates = vehicle.tireProductionDates || [];
      const newDate = task.candidate.tireProductionDate as string;
      if (!currentDates.includes(newDate)) {
        updates.tireProductionDates = [...currentDates, newDate];
      }
    }
    if (Object.keys(updates).length > 0) {
      onUpdateVehicle(updates);
    }
  };

  if (!isEditing) {
    return (
      <div className="content-section">
        <div className="section-header">
          <h2>车辆信息</h2>
          <button 
            className="privacy-toggle privacy-toggle-quiet"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 size={16} />
            <span>编辑</span>
          </button>
        </div>
        
        <div className="vehicle-info-grid">
          <div className="info-item">
            <label>VIN码/车架号</label>
            <span>{vehicle.vin || '未设置'}</span>
          </div>
          <div className="info-item">
            <label>生产日期</label>
            <span>{vehicle.productionDate || '未设置'}</span>
          </div>
          <div className="info-item">
            <label>交付日期</label>
            <span>{vehicle.deliveryDate || '未设置'}</span>
          </div>
          {vehicle.tireDotCodes && vehicle.tireDotCodes.length > 0 && (
            <div className="info-item">
              <label>轮胎DOT码</label>
              <div className="tire-dot-list">
                {vehicle.tireDotCodes.map((dot, idx) => (
                  <span key={idx} className="tire-dot">{dot}</span>
                ))}
              </div>
            </div>
          )}
          {vehicle.tireProductionDates && vehicle.tireProductionDates.length > 0 && (
            <div className="info-item">
              <label>轮胎生产日期</label>
              <div className="tire-date-list">
                {vehicle.tireProductionDates.map((date, idx) => (
                  <span key={idx} className="tire-date">{date}</span>
                ))}
              </div>
            </div>
          )}
          {vehicle.tireReplacementDate && (
            <div className="info-item">
              <label>轮胎更换日期</label>
              <span>{vehicle.tireReplacementDate}</span>
            </div>
          )}
        </div>

        {pendingVehicleTasks.length > 0 && (
          <div className="pending-tasks-panel">
            <div className="pending-tasks-header">
              <Car size={16} />
              <span>待确认的车辆信息</span>
            </div>
            {pendingVehicleTasks.map(task => {
              const vin = task.candidate.vin as string | undefined;
              const tireDotCode = task.candidate.tireDotCode as string | undefined;
              const tireProductionDate = task.candidate.tireProductionDate as string | undefined;
              
              return (
                <div key={task.id} className="pending-task-item">
                  <div>
                    <strong>{task.sourceName}</strong>
                    {vin && <p>VIN: {vin}</p>}
                    {tireDotCode && <p>DOT: {tireDotCode}</p>}
                    {tireProductionDate && <p>日期: {tireProductionDate}</p>}
                  </div>
                <div className="task-actions">
                  <button 
                    className="apply-task-btn"
                    onClick={() => handleApplyFromTask(task)}
                  >
                    <Check size={14} />
                    应用
                  </button>
                  <button 
                    className="view-task-btn"
                    onClick={onNavigateToRecognition}
                  >
                    <Upload size={14} />
                    查看
                  </button>
                </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="content-section">
      <div className="section-header">
        <h2>编辑车辆信息</h2>
        <div className="edit-actions">
          <button 
            className="privacy-toggle privacy-toggle-quiet"
            onClick={() => {
              setEditingVehicle({ ...vehicle });
              setIsEditing(false);
            }}
          >
            <X size={16} />
            <span>取消</span>
          </button>
          <button 
            className="save-edit-btn"
            onClick={handleSave}
          >
            <Check size={16} />
            <span>保存</span>
          </button>
        </div>
      </div>
      
      <div className="vehicle-edit-form">
        <div className="form-field">
          <label>VIN码/车架号</label>
          <input
            type="text"
            value={editingVehicle.vin || ''}
            onChange={(e) => setEditingVehicle({ ...editingVehicle, vin: e.target.value })}
            placeholder="请输入17位VIN码"
          />
        </div>
        
        <div className="form-field">
          <label>生产日期</label>
          <input
            type="date"
            value={editingVehicle.productionDate || ''}
            onChange={(e) => setEditingVehicle({ ...editingVehicle, productionDate: e.target.value })}
          />
        </div>
        
        <div className="form-field">
          <label>交付日期</label>
          <input
            type="date"
            value={editingVehicle.deliveryDate || ''}
            onChange={(e) => setEditingVehicle({ ...editingVehicle, deliveryDate: e.target.value })}
          />
        </div>
        
        <div className="form-field">
          <label>轮胎DOT码（逗号分隔）</label>
          <input
            type="text"
            value={(editingVehicle.tireDotCodes || []).join(', ')}
            onChange={(e) => setEditingVehicle({ 
              ...editingVehicle, 
              tireDotCodes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            })}
            placeholder="DOT XXXX 1223, DOT YYYY 4522"
          />
        </div>
        
        <div className="form-field">
          <label>轮胎生产日期（逗号分隔）</label>
          <input
            type="text"
            value={(editingVehicle.tireProductionDates || []).join(', ')}
            onChange={(e) => setEditingVehicle({ 
              ...editingVehicle, 
              tireProductionDates: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            })}
            placeholder="2023年第12周, 2022年第45周"
          />
        </div>
        
        <div className="form-field">
          <label>轮胎更换日期</label>
          <input
            type="date"
            value={editingVehicle.tireReplacementDate || ''}
            onChange={(e) => setEditingVehicle({ ...editingVehicle, tireReplacementDate: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
