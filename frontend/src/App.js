import _ from "lodash";
import React, { useState, useEffect } from "react";
import "./App.css";
import Chart from "./components/Chart";
import DataTable from "./components/DataTable";

import { Layout, Form, Select, InputNumber, Divider, Input, Card } from "antd";
import {
  locations as locationsData,
  genders as gendersData,
  plans as plansData
} from "./data";
import app from "./feathers";

const { Option } = Select;
const { Header, Content, Footer } = Layout;

const MultiSelect = ({ options = [], state, setState, placeholder }) => {
  return (
    <Select
      placeholder={placeholder}
      mode="multiple"
      style={{ minWidth: 150 }}
      defaultValue={[]}
      onChange={values => setState(values)}
      value={state}
      allowClear
    >
      {options.map(option => (
        <Option key={option} value={option}>
          {option}
        </Option>
      ))}
    </Select>
  );
};

const App = () => {
  const [locations, setLocations] = useState([]);
  const [gender, setGender] = useState("");
  const [plans, setPlans] = useState([]);
  const [age, setAge] = useState({});

  const [jahrZins, setJahrZins] = useState({
    "2019": 0.013,
    "2020": 0.012,
    "2021": 0.011,
    "2022": 0.01,
    "2023": 0.01
  });

  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const query = {
        Geschlecht: gender || undefined,
        Standort: locations.length ? { $in: locations } : undefined,
        Alter: age.from && age.to ? { $gt: age.from, $lte: age.to } : undefined,
        JahrZins: Object.entries(jahrZins)
          .filter(([_jahr, zins]) => !!zins)
          .map(([jahr, zins]) => ({ jahr, zins: +zins }))
      };
      try {
        setLoading(true);
        const res = await app.service("aggregator").find({ query });
        setLoading(false);
        console.log("res: ", res);
        setData(res);
      } catch (err) {
        console.log("err.message: ", err.message);
      }
    })();
  }, [locations, gender, age, jahrZins]);

  console.log({ jahrZins });

  return (
    <div className="App" style={{ backgroundColor: "#eee" }}>
      <Content style={{ height: "100vh" }}>
        <Header style={{ backgroundColor: "#002766" }}>
          <h1 style={{ color: "white" }}>DBO Insights</h1>
        </Header>
        <Content style={{ padding: "0 50px", marginTop: 64 }}>
          <Card title="Filter">
            <Form layout="inline">
              <Form.Item label="Standort">
                <MultiSelect
                  placeholder="Standort auswählen"
                  options={locationsData}
                  state={locations}
                  setState={setLocations}
                />
              </Form.Item>
              <Form.Item label="Alter">
                <InputNumber
                  placeholder="Von"
                  onChange={value => setAge({ ...age, from: value })}
                />
                {" - "}
                <InputNumber
                  placeholder="Bis"
                  onChange={value => setAge({ ...age, to: value })}
                />
              </Form.Item>
              <Form.Item label="Geschlecht">
                <Select
                  style={{ minWidth: 150 }}
                  onChange={value => setGender(value)}
                  value={gender}
                  allowClear
                >
                  <Option key="-" value="">
                    Alle
                  </Option>
                  {Object.entries(gendersData).map(([value, text]) => (
                    <Option key={value} value={value}>
                      {text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {/* <Form.Item label="Zusage / Plan">
              <MultiSelect
                placeholder="Plan auswählen"
                options={plansData}
                state={plans}
                setState={setPlans}
              />
            </Form.Item> */}
              <div style={{ marginTop: 10 }}>
                <Form.Item label="Zinsprognosen" />
                {Object.keys(jahrZins).map(jahr => {
                  return (
                    <Form.Item>
                      <Input
                        style={{ width: 150 }}
                        addonBefore={jahr}
                        defaultValue={jahrZins[jahr]}
                        onChange={zins => {
                          setJahrZins({
                            ...jahrZins,
                            [jahr]: zins.target.value
                          });
                        }}
                      />
                    </Form.Item>
                  );
                })}
              </div>
            </Form>
          </Card>
          <Card loading={loading} style={{ marginTop: 20 }}>
            <Chart data={data} />
          </Card>
          <Card loading={loading} style={{ marginTop: 20 }}>
            <DataTable data={data} />
          </Card>
        </Content>
        <Footer style={{ textAlign: "center", marginTop: 20 }}>
          Created by team häckermen
        </Footer>
      </Content>
    </div>
  );
};

export default App;
