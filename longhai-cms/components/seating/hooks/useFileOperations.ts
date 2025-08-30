import { useCallback } from 'react';
import { SeatingEditorState } from '../types';

interface UseFileOperationsProps {
  state: SeatingEditorState;
  onStateChange?: (newState: Partial<SeatingEditorState>) => void;
}

export function useFileOperations({ state, onStateChange }: UseFileOperationsProps) {
  
  // Save current state to JSON file
  const saveToFile = useCallback(() => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `seating-plan-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [state]);

  // Open file and load state
  const openFromFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const newState = JSON.parse(content) as SeatingEditorState;
        onStateChange?.(newState);
      } catch (error) {
        console.error('Error loading file:', error);
        alert('Error loading file. Please check if it\'s a valid seating plan file.');
      }
    };
    reader.readAsText(file);
  }, [onStateChange]);

  // Export to PDF
  const exportToPdf = useCallback(async () => {
    try {
      // This would integrate with a PDF library like jsPDF
      // For now, we'll create a simple PDF export
      const canvas = document.querySelector('svg') as SVGElement;
      if (!canvas) {
        alert('No canvas found to export');
        return;
      }

      // Convert SVG to canvas for PDF generation
      const svgData = new XMLSerializer().serializeToString(canvas);
      const canvas2 = document.createElement('canvas');
      const ctx = canvas2.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas2.width = img.width;
        canvas2.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        // Create PDF (this would need a PDF library)
        console.log('PDF export functionality would be implemented here');
        alert('PDF export functionality will be implemented');
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Error exporting to PDF');
    }
  }, []);

  // Export to SVG
  const exportToSvg = useCallback(() => {
    try {
      const svg = document.querySelector('svg') as SVGElement;
      if (!svg) {
        alert('No SVG found to export');
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(svgBlob);
      link.download = `seating-plan-${new Date().toISOString().split('T')[0]}.svg`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting to SVG:', error);
      alert('Error exporting to SVG');
    }
  }, []);

  // Validate seating plan
  const validateSeatingPlan = useCallback(() => {
    const issues: string[] = [];
    
    // Check for overlapping seats
    const seats = state.seats;
    for (let i = 0; i < seats.length; i++) {
      for (let j = i + 1; j < seats.length; j++) {
        const seat1 = seats[i];
        const seat2 = seats[j];
        const distance = Math.sqrt(
          Math.pow(seat1.x - seat2.x, 2) + Math.pow(seat1.y - seat2.y, 2)
        );
        if (distance < 20) { // Minimum distance between seats
          issues.push(`Seats ${seat1.label} and ${seat2.label} are too close`);
        }
      }
    }

    // Check for seats outside canvas
    const canvasWidth = 800; // This should come from props
    const canvasHeight = 800;
    seats.forEach(seat => {
      if (seat.x < 0 || seat.x > canvasWidth || seat.y < 0 || seat.y > canvasHeight) {
        issues.push(`Seat ${seat.label} is outside the canvas`);
      }
    });

    // Check for empty rows
    state.rows.forEach(row => {
      if (row.seats.length === 0) {
        issues.push(`Row ${row.label || row.id} has no seats`);
      }
    });

    if (issues.length === 0) {
      alert('✅ Seating plan is valid!');
    } else {
      alert(`❌ Found ${issues.length} issues:\n\n${issues.join('\n')}`);
    }
  }, [state]);

  return {
    saveToFile,
    openFromFile,
    exportToPdf,
    exportToSvg,
    validateSeatingPlan
  };
} 