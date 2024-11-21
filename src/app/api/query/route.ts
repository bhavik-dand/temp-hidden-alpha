// app/api/query/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface Stock {
  Ticker: string;
  'Market Capitalization (B)': number;
  'P/E Ratio': number;
  'ROE (%)': number;
  'Debt-to-Equity Ratio': number;
  'Dividend Yield (%)': number;
  'Revenue Growth (%)': number;
  'EPS Growth (%)': number;
  'Current Ratio': number;
  'Gross Margin (%)': number;
}

function parseCondition(condition: string) {
  const operators = ['>', '<', '>=', '<=', '='];
  let operator = operators.find(op => condition.includes(op));
  if (!operator) throw new Error(`No valid operator found in condition: ${condition}`);
  
  const [field, value] = condition.split(operator).map(s => s.trim());
  return {
    field,
    operator,
    value: parseFloat(value)
  };
}

function evaluateCondition(stock: Stock, condition: { field: string; operator: string; value: number }) {
  const stockValue = stock[condition.field as keyof Stock] as number;
  
  switch (condition.operator) {
    case '>': return stockValue > condition.value;
    case '<': return stockValue < condition.value;
    case '>=': return stockValue >= condition.value;
    case '<=': return stockValue <= condition.value;
    case '=': return stockValue === condition.value;
    default: return false;
  }
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    
    // Read and parse CSV
    const filePath = path.join(process.cwd(), 'data', 'sample.csv');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const stocks: Stock[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      cast: true // Automatically convert numbers
    });

    // Parse query conditions
    const conditions = query
      .split('AND')
      .map(condition => parseCondition(condition.trim()));

    // Filter stocks based on conditions
    const results = stocks.filter(stock =>
      conditions.every(condition => evaluateCondition(stock, condition))
    );

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process query' },
      { status: 400 }
    );
  }
}