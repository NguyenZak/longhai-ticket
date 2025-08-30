import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { IRootState } from '@/store';
import {
  addSeats,
  setSeats,
  updateSeat,
  deleteSeat,
  duplicateSeat,
  addZone,
  setZones,
  updateZone,
  deleteZone,
  duplicateZone,
  addShape,
  setShapes,
  updateShape,
  deleteShape,
  duplicateShape,
  addText,
  setTexts,
  updateText,
  deleteText,
  duplicateText,
  setSelectedItems,
  clearSelection,
  setActiveTool,
  setZoom,
  toggleGrid,
  setDrawingState,
  deleteSelected
} from '@/store/seatingSlice';
import { Seat, Zone, Shape, TextElement, ToolType, SelectionItem } from '../types';

export function useSeatingRedux() {
  const dispatch = useDispatch();
  
  // Selectors
  const seatingState = useSelector((state: IRootState) => state.seating);
  
  // Action dispatchers
  const actions = {
    addSeats: useCallback((seats: Seat[]) => {
      dispatch(addSeats(seats));
    }, [dispatch]),

    setSeats: useCallback((seats: Seat[] | ((prev: Seat[]) => Seat[])) => {
      if (typeof seats === 'function') {
        const currentSeats = seatingState.seats;
        dispatch(setSeats(seats(currentSeats)));
      } else {
        dispatch(setSeats(seats));
      }
    }, [dispatch, seatingState.seats]),

    updateSeat: useCallback((id: string, updates: Partial<Seat>) => {
      dispatch(updateSeat({ id, updates }));
    }, [dispatch]),

    deleteSeat: useCallback((id: string) => {
      dispatch(deleteSeat(id));
    }, [dispatch]),

    duplicateSeat: useCallback((id: string) => {
      dispatch(duplicateSeat(id));
    }, [dispatch]),

    addZone: useCallback((zone: Zone) => {
      dispatch(addZone(zone));
    }, [dispatch]),

    setZones: useCallback((zones: Zone[] | ((prev: Zone[]) => Zone[])) => {
      if (typeof zones === 'function') {
        const currentZones = seatingState.zones;
        dispatch(setZones(zones(currentZones)));
      } else {
        dispatch(setZones(zones));
      }
    }, [dispatch, seatingState.zones]),

    updateZone: useCallback((id: string, updates: Partial<Zone>) => {
      dispatch(updateZone({ id, updates }));
    }, [dispatch]),

    deleteZone: useCallback((id: string) => {
      dispatch(deleteZone(id));
    }, [dispatch]),

    duplicateZone: useCallback((id: string) => {
      dispatch(duplicateZone(id));
    }, [dispatch]),

    addShape: useCallback((shape: Shape) => {
      dispatch(addShape(shape));
    }, [dispatch]),

    setShapes: useCallback((shapes: Shape[] | ((prev: Shape[]) => Shape[])) => {
      if (typeof shapes === 'function') {
        const currentShapes = seatingState.shapes;
        dispatch(setShapes(shapes(currentShapes)));
      } else {
        dispatch(setShapes(shapes));
      }
    }, [dispatch, seatingState.shapes]),

    updateShape: useCallback((id: string, updates: Partial<Shape>) => {
      dispatch(updateShape({ id, updates }));
    }, [dispatch]),

    deleteShape: useCallback((id: string) => {
      dispatch(deleteShape(id));
    }, [dispatch]),

    duplicateShape: useCallback((id: string) => {
      dispatch(duplicateShape(id));
    }, [dispatch]),

    addText: useCallback((text: TextElement) => {
      dispatch(addText(text));
    }, [dispatch]),

    setTexts: useCallback((texts: TextElement[] | ((prev: TextElement[]) => TextElement[])) => {
      if (typeof texts === 'function') {
        const currentTexts = seatingState.texts;
        dispatch(setTexts(texts(currentTexts)));
      } else {
        dispatch(setTexts(texts));
      }
    }, [dispatch, seatingState.texts]),

    updateText: useCallback((id: string, updates: Partial<TextElement>) => {
      dispatch(updateText({ id, updates }));
    }, [dispatch]),

    deleteText: useCallback((id: string) => {
      dispatch(deleteText(id));
    }, [dispatch]),

    duplicateText: useCallback((id: string) => {
      dispatch(duplicateText(id));
    }, [dispatch]),

    setSelectedItems: useCallback((items: SelectionItem[]) => {
      dispatch(setSelectedItems(items));
    }, [dispatch]),

    clearSelection: useCallback(() => {
      dispatch(clearSelection());
    }, [dispatch]),

    setActiveTool: useCallback((tool: ToolType) => {
      dispatch(setActiveTool(tool));
    }, [dispatch]),

    setZoom: useCallback((zoom: number) => {
      dispatch(setZoom(zoom));
    }, [dispatch]),

    toggleGrid: useCallback(() => {
      dispatch(toggleGrid());
    }, [dispatch]),

    setDrawingState: useCallback((drawingState: typeof seatingState.drawingState) => {
      dispatch(setDrawingState(drawingState));
    }, [dispatch]),

    deleteSelected: useCallback(() => {
      dispatch(deleteSelected());
    }, [dispatch])
  };

  return {
    // State
    seats: seatingState.seats,
    zones: seatingState.zones,
    shapes: seatingState.shapes,
    texts: seatingState.texts,
    selectedItems: seatingState.selectedItems,
    activeTool: seatingState.activeTool,
    zoom: seatingState.zoom,
    gridEnabled: seatingState.gridEnabled,
    drawingState: seatingState.drawingState,
    
    // Actions
    ...actions
  };
}
