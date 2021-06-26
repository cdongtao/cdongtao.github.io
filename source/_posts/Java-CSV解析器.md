---
title: CSV解析器
tags: [csv,Template]
categories: [Project]
---

## 有三种用于CSV的开源API

### OpenCSV
```
<dependency>
    <groupId>com.opencsv</groupId>
    <artifactId>opencsv</artifactId>
    <version>3.8</version>
</dependency>
```
### 使用
```

import java.io.FileReader;
import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
 
import au.com.bytecode.opencsv.CSVReader;
import au.com.bytecode.opencsv.CSVWriter;
import au.com.bytecode.opencsv.bean.CsvToBean;
import au.com.bytecode.opencsv.bean.HeaderColumnNameTranslateMappingStrategy;
 
public class OpenCSVParserExample {
 
	public static void main(String[] args) throws IOException {
 
		List<Employee> emps = parseCSVFileLineByLine();
		System.out.println("**********");
		parseCSVFileAsList();
		System.out.println("**********");
		parseCSVToBeanList();
		System.out.println("**********");
		writeCSVData(emps);
	}
 
	private static void parseCSVToBeanList() throws IOException {
		
		HeaderColumnNameTranslateMappingStrategy<Employee> beanStrategy = new HeaderColumnNameTranslateMappingStrategy<Employee>();
		beanStrategy.setType(Employee.class);
		
		Map<String, String> columnMapping = new HashMap<String, String>();
		columnMapping.put("ID", "id");
		columnMapping.put("Name", "name");
		columnMapping.put("Role", "role");
		//columnMapping.put("Salary", "salary");
		
		beanStrategy.setColumnMapping(columnMapping);
		
		CsvToBean<Employee> csvToBean = new CsvToBean<Employee>();
		CSVReader reader = new CSVReader(new FileReader("employees.csv"));
		List<Employee> emps = csvToBean.parse(beanStrategy, reader);
		System.out.println(emps);
	}
 
	private static void writeCSVData(List<Employee> emps) throws IOException {
		StringWriter writer = new StringWriter();
		CSVWriter csvWriter = new CSVWriter(writer,'#');
		List<String[]> data  = toStringArray(emps);
		csvWriter.writeAll(data);
		csvWriter.close();
		System.out.println(writer);
	}
 
	private static List<String[]> toStringArray(List<Employee> emps) {
		List<String[]> records = new ArrayList<String[]>();
		//add header record
		records.add(new String[]{"ID","Name","Role","Salary"});
		Iterator<Employee> it = emps.iterator();
		while(it.hasNext()){
			Employee emp = it.next();
			records.add(new String[]{emp.getId(),emp.getName(),emp.getRole(),emp.getSalary()});
		}
		return records;
	}
 
	private static List<Employee> parseCSVFileLineByLine() throws IOException {
		//create CSVReader object
		CSVReader reader = new CSVReader(new FileReader("employees.csv"), ',');
		
		List<Employee> emps = new ArrayList<Employee>();
		//read line by line
		String[] record = null;
		//skip header row
		reader.readNext();
		
		while((record = reader.readNext()) != null){
			Employee emp = new Employee();
			emp.setId(record[0]);
			emp.setName(record[1]);
			emp.setRole(record[2]);
			emp.setSalary(record[3]);
			emps.add(emp);
		}
		
		reader.close();
		
		System.out.println(emps);
		return emps;
	}
	
	private static void parseCSVFileAsList() throws IOException {
		//create CSVReader object
		CSVReader reader = new CSVReader(new FileReader("employees.csv"), ',');
 
		List<Employee> emps = new ArrayList<Employee>();
		//read all lines at once
		List<String[]> records = reader.readAll();
		
		Iterator<String[]> iterator = records.iterator();
		//skip header row
		iterator.next();
		
		while(iterator.hasNext()){
			String[] record = iterator.next();
			Employee emp = new Employee();
			emp.setId(record[0]);
			emp.setName(record[1]);
			emp.setRole(record[2]);
			emp.setSalary(record[3]);
			emps.add(emp);
		}
		
		reader.close();
		
		System.out.println(emps);
	}
 
}
```
### Apache Commmons CSV
```
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-csv</artifactId>
    <version>1.3</version>
</dependency>
```
### 使用
```

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
 
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
 
public class ApacheCommonsCSVParserExample {
 
	public static void main(String[] args) throws FileNotFoundException, IOException {
		
		//Create the CSVFormat object
		CSVFormat format = CSVFormat.RFC4180.withHeader().withDelimiter(',');
		
		//initialize the CSVParser object
		CSVParser parser = new CSVParser(new FileReader("employees.csv"), format);
		
		List<Employee> emps = new ArrayList<Employee>();
		for(CSVRecord record : parser){
			Employee emp = new Employee();
			emp.setId(record.get("ID"));
			emp.setName(record.get("Name"));
			emp.setRole(record.get("Role"));
			emp.setSalary(record.get("Salary"));
			emps.add(emp);
		}
		//close the parser
		parser.close();
		
		System.out.println(emps);
		
		//CSV Write Example using CSVPrinter
		CSVPrinter printer = new CSVPrinter(System.out, format.withDelimiter('#'));
		System.out.println("********");
		printer.printRecord("ID","Name","Role","Salary");
		for(Employee emp : emps){
			List<String> empData = new ArrayList<String>();
			empData.add(emp.getId());
			empData.add(emp.getName());
			empData.add(emp.getRole());
			empData.add(emp.getSalary());
			printer.printRecord(empData);
		}
		//close the printer
		printer.close();
	}
 
}
```

### Super CSV
```
<dependency>
    <groupId>net.sf.supercsv</groupId>
    <artifactId>super-csv</artifactId>
    <version>2.4.0</version>
</dependency>
```
### 使用
```

import java.io.FileReader;
import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
 
import org.supercsv.cellprocessor.Optional;
import org.supercsv.cellprocessor.constraint.NotNull;
import org.supercsv.cellprocessor.constraint.UniqueHashCode;
import org.supercsv.cellprocessor.ift.CellProcessor;
import org.supercsv.io.CsvBeanReader;
import org.supercsv.io.CsvBeanWriter;
import org.supercsv.io.ICsvBeanReader;
import org.supercsv.io.ICsvBeanWriter;
import org.supercsv.prefs.CsvPreference;
 
public class SuperCSVParserExample {
 
	public static void main(String[] args) throws IOException {
 
		List<Employee> emps = readCSVToBean();
		System.out.println(emps);
		System.out.println("******");
		writeCSVData(emps);
	}
 
	private static void writeCSVData(List<Employee> emps) throws IOException {
		ICsvBeanWriter beanWriter = null;
		StringWriter writer = new StringWriter();
		try{
			beanWriter = new CsvBeanWriter(writer, CsvPreference.STANDARD_PREFERENCE);
			final String[] header = new String[]{"id","name","role","salary"};
			final CellProcessor[] processors = getProcessors();
            
			// write the header
            beanWriter.writeHeader(header);
            
            //write the bean's data
            for(Employee emp: emps){
            	beanWriter.write(emp, header, processors);
            }
		}finally{
			if( beanWriter != null ) {
                beanWriter.close();
			}
		}
		System.out.println("CSV Data\n"+writer.toString());
	}
 
	private static List<Employee> readCSVToBean() throws IOException {
		ICsvBeanReader beanReader = null;
		List<Employee> emps = new ArrayList<Employee>();
		try {
			beanReader = new CsvBeanReader(new FileReader("employees.csv"),
					CsvPreference.STANDARD_PREFERENCE);
 
			// the name mapping provide the basis for bean setters 
			final String[] nameMapping = new String[]{"id","name","role","salary"};
			//just read the header, so that it don't get mapped to Employee object
			final String[] header = beanReader.getHeader(true);
			final CellProcessor[] processors = getProcessors();
 
			Employee emp;
			
			while ((emp = beanReader.read(Employee.class, nameMapping,
					processors)) != null) {
				emps.add(emp);
			}
 
		} finally {
			if (beanReader != null) {
				beanReader.close();
			}
		}
		return emps;
	}
 
	private static CellProcessor[] getProcessors() {
		
		final CellProcessor[] processors = new CellProcessor[] { 
                new UniqueHashCode(), // ID (must be unique)
                new NotNull(), // Name
                new Optional(), // Role
                new NotNull() // Salary
        };
		return processors;
	}
 
}
```