import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

export async function exportToPDF(content: string, filename: string = 'tourism-proposal'): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // PDF用にコンテンツを整形
  const lines = content.split('\n');
  let y = 20;
  const lineHeight = 7;
  const maxWidth = 170;
  
  // 日本語フォント対応のため、基本的なASCII文字での出力
  pdf.setFont('helvetica');
  pdf.setFontSize(12);
  
  for (const line of lines) {
    if (y > 280) { // 新しいページが必要
      pdf.addPage();
      y = 20;
    }
    
    if (line.trim()) {
      const splitText = pdf.splitTextToSize(line, maxWidth);
      pdf.text(splitText, 20, y);
      y += lineHeight * splitText.length;
    } else {
      y += lineHeight / 2;
    }
  }
  
  pdf.save(`${filename}.pdf`);
}

export async function exportToWord(content: string, filename: string = 'tourism-proposal'): Promise<void> {
  const paragraphs = content.split('\n\n').map(paragraph => 
    new Paragraph({
      children: [new TextRun(paragraph)],
      spacing: {
        after: 200,
      },
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  });
  
  saveAs(blob, `${filename}.docx`);
}

export function exportToMarkdown(content: string, filename: string = 'tourism-proposal'): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${filename}.md`);
}