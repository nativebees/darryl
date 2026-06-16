import { Home, Landmark, KeyRound, ReceiptText } from 'lucide-react';
import { Panel, PanelHeader, Field, TextInput, NumberInput, SelectInput, Slider, Toggle } from './ui.jsx';

export default function InputRail({ form, rentalMode, setField, setMarket, setRentalMode }) {
  const pctFmt = (v) => `${v}%`;

  return (
    <aside className="flex flex-col gap-[18px] lg:sticky lg:top-[74px] lg:max-h-[calc(100vh-90px)] lg:overflow-y-auto lg:pr-1 rail-scroll" aria-label="Investment assumptions">

      {/* PROPERTY */}
      <Panel>
        <PanelHeader icon={Home} title="The property" sub="Auto-filled where possible · override anything" />
        <Field label="Address / nickname" htmlFor="address">
          <TextInput id="address" value={form.address} onChange={(v) => setField('address', v)} placeholder="e.g. 12345 Sunny Ln, Yucca Valley CA" />
        </Field>
        <Field label="Market" hint="drives defaults" htmlFor="market">
          <SelectInput id="market" value={form.market} onChange={setMarket}>
            <option value="palm-springs">Palm Springs</option>
            <option value="yucca-valley">Yucca Valley / Joshua Tree</option>
            <option value="borrego">Borrego Springs</option>
            <option value="cathedral-city">Cathedral City</option>
            <option value="palm-desert">Palm Desert / La Quinta</option>
            <option value="big-bear">Big Bear</option>
            <option value="idyllwild">Idyllwild</option>
            <option value="other-desert">Other desert (CA)</option>
            <option value="other-ca">Other California</option>
          </SelectInput>
        </Field>
        <Field label="Purchase price ($)" htmlFor="price">
          <NumberInput id="price" value={form.price} onChange={(v) => setField('price', v)} />
        </Field>
        <Field label="Annual property tax ($)" htmlFor="propTax" helper="Defaults to 1.2% of price (CA Prop 13 baseline)">
          <NumberInput id="propTax" value={form.propTax} onChange={(v) => setField('propTax', v)} />
        </Field>
        <Slider id="landPct" label="Land allocation" value={form.landPct} min={5} max={50} step={1} format={pctFmt}
          onChange={(v) => setField('landPct', v)}
          helper="Desert SFH typical: 15–22% · Mountain: 30–40% · Coastal: 40%+" />
      </Panel>

      {/* FINANCING */}
      <Panel>
        <PanelHeader icon={Landmark} title="Financing & depreciation" sub="How the purchase is structured" />
        <Slider id="downPct" label="Down payment" value={form.downPct} min={20} max={40} step={5} format={pctFmt} onChange={(v) => setField('downPct', v)} />
        <Field label="Investment mortgage rate (%)" htmlFor="mortRate">
          <NumberInput id="mortRate" value={form.mortRate} step="0.1" onChange={(v) => setField('mortRate', v)} />
        </Field>
        <Slider id="costSeg" label="Cost segregation reclassification" value={form.costSeg} min={10} max={40} step={1} format={pctFmt}
          onChange={(v) => setField('costSeg', v)} helper="SFH typical: 20–35% · Condo: 15–22%" />
        <Slider id="bonusDep" label="Bonus depreciation rate" value={form.bonusDep} min={0} max={100} step={20} format={pctFmt}
          onChange={(v) => setField('bonusDep', v)} helper="100% under OBBBA (Jul 2025) for property acquired after Jan 19, 2025" />
        <Field label="Cost-seg study cost ($)" htmlFor="csCost">
          <NumberInput id="csCost" value={form.csCost} onChange={(v) => setField('csCost', v)} />
        </Field>
        <Field label="Closing costs ($)" hint="~2% typical" htmlFor="closingCosts">
          <NumberInput id="closingCosts" value={form.closingCosts} onChange={(v) => setField('closingCosts', v)} />
        </Field>
      </Panel>

      {/* RENTAL */}
      <Panel>
        <PanelHeader icon={KeyRound} title="The rental play" sub="Auto-estimated from market & price" />
        <Toggle
          ariaLabel="Rental strategy"
          value={rentalMode}
          onChange={setRentalMode}
          options={[
            { value: 'str', label: 'Short-term (STR)' },
            { value: 'ltr', label: 'Long-term (LTR)' },
          ]}
        />
        <Field label="Gross annual rental ($)" htmlFor="rental"
          helper={rentalMode === 'str' ? 'STR estimate based on market & price' : 'LTR estimate based on market & price'}>
          <NumberInput id="rental" value={form.rental} onChange={(v) => setField('rental', v)} />
        </Field>
        <Slider id="vacancy" label="Vacancy / off-season" value={form.vacancy} min={0} max={40} step={1} format={pctFmt} onChange={(v) => setField('vacancy', v)} />
        <Slider id="expRatio" label="Operating expense ratio" value={form.expRatio} min={15} max={60} step={1} format={pctFmt}
          onChange={(v) => setField('expRatio', v)}
          helper={rentalMode === 'str' ? 'STR: 30–40% (cleaning, platform fees, mgmt)' : 'LTR: 20–30% (maintenance, mgmt, turnover)'} />
        <Slider id="rentGrowth" label="Annual rental growth" value={form.rentGrowth} min={1} max={6} step={0.5} format={pctFmt} onChange={(v) => setField('rentGrowth', v)} />
        <Slider id="appRate" label="Annual appreciation" value={form.appRate} min={1} max={8} step={0.5} format={pctFmt} onChange={(v) => setField('appRate', v)} />
        <Field label="Insurance + utilities / yr ($)" hint="extra ops" htmlFor="extraOps">
          <NumberInput id="extraOps" value={form.extraOps} onChange={(v) => setField('extraOps', v)} />
        </Field>
      </Panel>

      {/* INCOME / TAX */}
      <Panel>
        <PanelHeader icon={ReceiptText} title="2027 income & tax" sub="IPO year · REPS active · second property" />
        <Field label="W2 income ($)" htmlFor="w2">
          <NumberInput id="w2" value={form.w2} onChange={(v) => setField('w2', v)} />
        </Field>
        <Field label="IPO / equity proceeds — taxable in 2027 ($)" htmlFor="ipo">
          <NumberInput id="ipo" value={form.ipo} onChange={(v) => setField('ipo', v)} />
        </Field>
        <Field label="Federal marginal rate (%)" htmlFor="fedRate">
          <NumberInput id="fedRate" value={form.fedRate} step="0.5" onChange={(v) => setField('fedRate', v)} />
        </Field>
        <Field label="CA state rate (%)" htmlFor="caRate">
          <NumberInput id="caRate" value={form.caRate} step="0.1" onChange={(v) => setField('caRate', v)} />
        </Field>
        <Field label="REPS status (Jessi)" htmlFor="reps">
          <SelectInput id="reps" value={form.reps} onChange={(v) => setField('reps', v)}>
            <option value="1">Active — losses offset ordinary income</option>
            <option value="0">Inactive — passive losses suspended</option>
          </SelectInput>
        </Field>
        <Field label="Existing PS home strategy" htmlFor="psStrategy" helper="Affects personal-use day allocation under §280A">
          <SelectInput id="psStrategy" value={form.psStrategy} onChange={(v) => setField('psStrategy', v)}>
            <option value="primary">Keep as primary residence</option>
            <option value="rotate">Rotate use between both properties</option>
            <option value="rental">Convert PS to full-time rental</option>
          </SelectInput>
        </Field>
      </Panel>
    </aside>
  );
}
